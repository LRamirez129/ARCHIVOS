// Frontend/condominio/src/reporteria/ReporteIngresosEgresos.js
import React, { useState, useEffect, useRef } from 'react'; // Importa useRef
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf'; // Importa jsPDF
import html2canvas from 'html2canvas'; // Importa html2canvas

const BACKEND_URL = 'http://localhost:3002';

const meses = [
    { name: 'Enero', value: 1, short: 'Ene' },
    { name: 'Febrero', value: 2, short: 'Feb' },
    { name: 'Marzo', value: 3, short: 'Mar' },
    { name: 'Abril', value: 4, short: 'Abr' },
    { name: 'Mayo', value: 5, short: 'May' },
    { name: 'Junio', value: 6, short: 'Jun' },
    { name: 'Julio', value: 7, short: 'Jul' },
    { name: 'Agosto', value: 8, short: 'Ago' },
    { name: 'Septiembre', value: 9, short: 'Sep' },
    { name: 'Octubre', value: 10, short: 'Oct' },
    { name: 'Noviembre', value: 11, short: 'Nov' },
    { name: 'Diciembre', value: 12, short: 'Dic' }
];

function ReporteIngresosEgresos() {
    // Referencia para el elemento HTML que queremos convertir a PDF
    const reportRef = useRef(); // <-- NUEVO: Crea una referencia para el div del reporte

    const [year, setYear] = useState(new Date().getFullYear());
    const [monthDesde, setMonthDesde] = useState(1);
    const [monthHasta, setMonthHasta] = useState(12);

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReportData = async () => {
        if (parseInt(monthDesde) > parseInt(monthHasta)) {
            alert('El mes "Desde" no puede ser posterior al mes "Hasta". Por favor, ajusta las fechas.');
            return;
        }

        setLoading(true);
        setError(null);
        setReportData(null);

        try {
            const url = `${BACKEND_URL}/api/reportes-ingresos-egresos?year=${year}&monthDesde=${monthDesde}&monthHasta=${monthHasta}`;
            console.log('Fetching data from:', url);
            const response = await fetch(url);

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`Error al obtener datos: ${response.status} - ${errorBody.message || 'Error desconocido del servidor.'}`);
            }

            const data = await response.json();
            console.log('Data received:', data);
            setReportData(data);

        } catch (err) {
            console.error('Error en fetchReportData:', err);
            setError(err.message || 'Hubo un problema al cargar el reporte.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [year, monthDesde, monthHasta]);

    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear + 1; i >= currentYear - 5; i--) {
            years.push(<option key={i} value={i}>{i}</option>);
        }
        return years;
    };

    const exportToExcel = () => {
        if (!reportData) {
            alert('No hay datos de reporte para exportar.');
            return;
        }

        const { mesesReporte, ingresos, egresos, totalIngresos, totalEgresos, balanceNeto } = reportData;

        let dataForExcel = [];

        dataForExcel.push(['Reporte de Ingresos y Egresos']);
        dataForExcel.push(['Período:', `${meses[monthDesde - 1].name} a ${meses[monthHasta - 1].name} de ${year}`]);
        dataForExcel.push([]);

        dataForExcel.push(['Total Ingresos:', (totalIngresos ?? 0).toFixed(2)]);
        dataForExcel.push(['Total Egresos:', (totalEgresos ?? 0).toFixed(2)]);
        dataForExcel.push(['Balance Neto:', (balanceNeto ?? 0).toFixed(2)]);
        dataForExcel.push([]);

        const headers = ['Rubro', ...mesesReporte, 'Total'];
        dataForExcel.push(headers);

        dataForExcel.push(['INGRESOS']);
        ingresos.forEach(item => {
            const row = [item.rubro];
            mesesReporte.forEach(mes => {
                row.push((item[mes] ?? 0).toFixed(2));
            });
            row.push((item.total ?? 0).toFixed(2));
            dataForExcel.push(row);
        });
        dataForExcel.push(['TOTAL INGRESOS', ...Array(mesesReporte.length).fill(''), (totalIngresos ?? 0).toFixed(2)]);
        dataForExcel.push([]);

        dataForExcel.push(['EGRESOS']);
        egresos.forEach(item => {
            const row = [item.rubro];
            mesesReporte.forEach(mes => {
                row.push((item[mes] ?? 0).toFixed(2));
            });
            row.push((item.total ?? 0).toFixed(2));
            dataForExcel.push(row);
        });
        dataForExcel.push(['TOTAL EGRESOS', ...Array(mesesReporte.length).fill(''), (totalEgresos ?? 0).toFixed(2)]);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(dataForExcel);

        const headerWidths = headers.map(header => ({ wch: header.length + 2 }));
        ws['!cols'] = headerWidths;

        XLSX.utils.book_append_sheet(wb, ws, 'Reporte IE');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        
        const fileName = `Reporte_Ingresos_Egresos_${year}_${meses[monthDesde - 1].short}_${meses[monthHasta - 1].short}.xlsx`;
        saveAs(dataBlob, fileName);
    };

    // ****** FUNCIÓN para generar PDF ******
    const exportToPDF = async () => {
        if (!reportData || !reportRef.current) {
            alert('No hay datos de reporte o el elemento del reporte no está listo para exportar a PDF.');
            return;
        }

        setLoading(true); // Puedes mostrar un mensaje de "Generando PDF..."
        try {
            // Usa html2canvas para renderizar el elemento HTML del reporte como una imagen
            const canvas = await html2canvas(reportRef.current, {
                scale: 2, // Aumenta la escala para mejor calidad en el PDF
                useCORS: true // Si tienes imágenes de otro origen, habilita CORS
            });

            const imgData = canvas.toDataURL('image/png'); // Obtén la imagen en formato base64
            const pdf = new jsPDF('p', 'mm', 'a4'); // Crea un nuevo documento PDF en formato A4, orientación 'p' (portrait)

            const imgWidth = 210; // Ancho de una página A4 en mm (210mm)
            const pageHeight = 297; // Alto de una página A4 en mm (297mm)
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calcula la altura de la imagen para que encaje en el ancho de la página

            let heightLeft = imgHeight;
            let position = 0;

            // Si el contenido es más largo que una página, añade nuevas páginas
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Nombre del archivo PDF
            const fileName = `Reporte_Ingresos_Egresos_${year}_${meses[monthDesde - 1].short}_${meses[monthHasta - 1].short}.pdf`;
            pdf.save(fileName); // Guarda el archivo PDF
            
        } catch (err) {
            console.error('Error al generar PDF:', err);
            setError('Error al generar el PDF: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    // Función para imprimir el reporte utilizando la función de impresión del navegador
    // Decides si quieres mantener esto o que el botón de "Imprimir" genere directamente el PDF.
    // Si quieres que el botón "Imprimir Reporte" genere el PDF, simplemente llama a exportToPDF() aquí.
    const printReport = () => {
        // Opción 1: Usa la impresión del navegador
        window.print();
        // Opción 2: O llama a la función de exportar a PDF directamente si el botón dice "Generar PDF"
        // exportToPDF(); 
    };

    // === RENDERIZADO DEL COMPONENTE ===
    return (
        <div className="report-container" ref={reportRef}> {/* <-- IMPORTANTE: Asigna la referencia aquí */}
            <h1>Reporte de Ingresos y Egresos</h1>

            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="year">Año:</label>
                    <select
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {getYearOptions()}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="monthDesde">Mes Desde:</label>
                    <select
                        id="monthDesde"
                        value={monthDesde}
                        onChange={(e) => setMonthDesde(e.target.value)}
                    >
                        {meses.map(mes => (
                            <option key={mes.value} value={mes.value}>{mes.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="monthHasta">Mes Hasta:</label>
                    <select
                        id="monthHasta"
                        value={monthHasta}
                        onChange={(e) => setMonthHasta(e.target.value)}
                    >
                        {meses.map(mes => (
                            <option key={mes.value} value={mes.value}>{mes.name}</option>
                        ))}
                    </select>
                </div>
                {/* Botones de acción */}
                <button onClick={exportToExcel} className="btn btn-success">
                    Exportar a Excel
                </button>
                {/* BOTÓN PARA EXPORTAR A PDF */}
                <button onClick={exportToPDF} className="btn btn-info">
                    Exportar a PDF
                </button>
                {/* Puedes mantener un botón de imprimir separado o eliminarlo si prefieres solo PDF */}
                <button onClick={printReport} className="btn btn-secondary">
                    Imprimir Reporte (Navegador)
                </button>
            </div>

            {/* Mensajes de estado: cargando o error */}
            {loading && <div className="loading-message">Cargando reporte...</div>}
            {error && <div className="error-message">Error: {error}</div>}

            {/* Renderiza el reporte solo si hay datos (reportData no es null) */}
            {reportData && (
                <>
                    {/* Resumen del reporte */}
                    <div className="report-summary">
                        <h3>Resumen del Período</h3>
                        <p>Total Ingresos: <span>${(reportData.totalIngresos ?? 0).toFixed(2)}</span></p>
                        <p>Total Egresos: <span>${(reportData.totalEgresos ?? 0).toFixed(2)}</span></p>
                        <p>Balance Neto: <span>${(reportData.balanceNeto ?? 0).toFixed(2)}</span></p>
                    </div>

                    {/* Tabla de detalle del reporte */}
                    <div className="report-table-container">
                        <h2>Detalle del Reporte</h2>
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Rubro</th>
                                    {reportData.mesesReporte.map((mes, index) => (
                                        <th key={index}>{mes}</th>
                                    ))}
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={2 + reportData.mesesReporte.length}>
                                        <strong>INGRESOS</strong>
                                    </td>
                                </tr>
                                {reportData.ingresos.map((item, index) => (
                                    <tr key={`ingreso-${item.rubro || index}`}>
                                        <td>{item.rubro}</td>
                                        {reportData.mesesReporte.map((mes, mesIndex) => (
                                            <td key={`ingreso-${item.rubro || index}-${mesIndex}`}>
                                                {(item[mes] ?? 0).toFixed(2)}
                                            </td>
                                        ))}
                                        <td>${(item.total ?? 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={1 + reportData.mesesReporte.length}>
                                        <strong>TOTAL INGRESOS</strong>
                                    </td>
                                    <td><strong>${(reportData.totalIngresos ?? 0).toFixed(2)}</strong></td>
                                </tr>

                                <tr>
                                    <td colSpan={2 + reportData.mesesReporte.length}>
                                        <strong>EGRESOS</strong>
                                    </td>
                                </tr>
                                {reportData.egresos.map((item, index) => (
                                    <tr key={`egreso-${item.rubro || index}`}>
                                        <td>{item.rubro}</td>
                                        {reportData.mesesReporte.map((mes, mesIndex) => (
                                            <td key={`egreso-${item.rubro || index}-${mesIndex}`}>
                                                {(item[mes] ?? 0).toFixed(2)}
                                            </td>
                                        ))}
                                        <td>${(item.total ?? 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="total-row">
                                    <td colSpan={1 + reportData.mesesReporte.length}>
                                        <strong>TOTAL EGRESOS</strong>
                                    </td>
                                    <td><strong>${(reportData.totalEgresos ?? 0).toFixed(2)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default ReporteIngresosEgresos;