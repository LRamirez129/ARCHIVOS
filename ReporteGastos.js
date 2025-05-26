// Frontend/condominio/src/reporteria/ReporteGastos.js
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

function ReporteGastos() {
    const reportRef = useRef();

    // Estados para filtros
    const [yearDesde, setYearDesde] = useState(new Date().getFullYear());
    const [monthDesde, setMonthDesde] = useState(1);
    const [yearHasta, setYearHasta] = useState(new Date().getFullYear());
    const [monthHasta, setMonthHasta] = useState(12);
    const [selectedTipoGasto, setSelectedTipoGasto] = useState(''); // ID del tipo de gasto
    const [nombreProveedor, setNombreProveedor] = useState('');

    // Estados para datos del reporte
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tiposGasto, setTiposGasto] = useState([]); // Para el dropdown de tipos de gasto

    // Fetch Tipos de Gasto al cargar el componente
    useEffect(() => {
        const fetchTiposGasto = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/reportes-gastos/tipos-gasto`);
                if (!response.ok) {
                    throw new Error('Error al cargar tipos de gasto.');
                }
                const data = await response.json();
                // El backend ahora devuelve { id: 'NombreTipo', nombre: 'NombreTipo' }
                // por lo que el mapeo aquí es directo.
                setTiposGasto([{ id: '', nombre: 'Todos' }, ...data]); // Añade opción "Todos" con ID vacío
            } catch (err) {
                console.error('Error fetching tipos de gasto:', err);
                setError('No se pudieron cargar los tipos de gasto.');
            }
        };
        fetchTiposGasto();
    }, []); // Se ejecuta solo una vez al montar

    const fetchReportData = async () => {
        if (
            (parseInt(yearDesde) > parseInt(yearHasta)) ||
            (parseInt(yearDesde) === parseInt(yearHasta) && parseInt(monthDesde) > parseInt(monthHasta))
        ) {
            alert('El rango de fechas no es válido. La fecha "Desde" no puede ser posterior a la fecha "Hasta".');
            return;
        }

        setLoading(true);
        setError(null);
        setReportData(null);

        try {
            const params = new URLSearchParams({
                yearDesde: yearDesde,
                monthDesde: monthDesde,
                yearHasta: yearHasta,
                monthHasta: monthHasta,
                tipoGastoId: selectedTipoGasto, // Este será el nombre del tipo de gasto
                nombreProveedor: nombreProveedor
            }).toString();

            const url = `${BACKEND_URL}/api/reportes-gastos?${params}`;
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

    // Ejecuta fetchReportData cuando cambian los filtros
    // Se elimina el `WorkspaceReportData()` inicial porque el `useEffect` ya lo hace
    // y para evitar un doble fetch al inicio si ya hay valores por defecto.
    useEffect(() => {
        // Un pequeño retraso para evitar llamadas excesivas mientras el usuario escribe
        const handler = setTimeout(() => {
            fetchReportData();
        }, 300); // Espera 300ms después de que el usuario deja de escribir/seleccionar
        return () => {
            clearTimeout(handler);
        };
    }, [yearDesde, monthDesde, yearHasta, monthHasta, selectedTipoGasto, nombreProveedor]);


    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear + 1; i >= currentYear - 5; i--) {
            years.push(<option key={i} value={i}>{i}</option>);
        }
        return years;
    };

    const exportToExcel = () => {
        if (!reportData || !reportData.gastos || reportData.gastos.length === 0) {
            alert('No hay datos para exportar a Excel.');
            return;
        }

        const { gastos, totalGastos } = reportData;

        let dataForExcel = [];

        // Título del reporte
        dataForExcel.push(['Reporte Detallado de Gastos de Condominio']);
        dataForExcel.push([
            `Período: ${meses[monthDesde - 1].name} ${yearDesde} - ${meses[monthHasta - 1].name} ${yearHasta}`
        ]);
        if (selectedTipoGasto) {
            // Encuentra el nombre del tipo de gasto si 'selectedTipoGasto' es el nombre
            const tipo = tiposGasto.find(t => t.id === selectedTipoGasto);
            dataForExcel.push([`Tipo de Gasto: ${tipo ? tipo.nombre : selectedTipoGasto}`]);
        }
        if (nombreProveedor) {
            dataForExcel.push([`Proveedor: ${nombreProveedor}`]);
        }
        dataForExcel.push([]); // Fila en blanco

        // Resumen
        dataForExcel.push(['Total Gastos:', (totalGastos ?? 0).toFixed(2)]);
        dataForExcel.push([]); // Fila en blanco

        // Encabezados de la tabla detallada
        const headers = ['Fecha Gasto', 'Tipo Gasto', 'Concepto', 'Monto', 'Proveedor', 'NIT Proveedor'];
        dataForExcel.push(headers);

        // Datos de los gastos
        gastos.forEach(gasto => {
            dataForExcel.push([
                gasto.fechaGasto,
                gasto.tipoGasto,
                gasto.concepto,
                (gasto.monto ?? 0).toFixed(2),
                gasto.proveedorNombre,
                gasto.proveedorNit
            ]);
        });

        // Fila de total
        dataForExcel.push([]);
        dataForExcel.push(['TOTAL GENERAL', '', '', (totalGastos ?? 0).toFixed(2), '', '']);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(dataForExcel);

        // Auto-ajustar ancho de columnas (básico)
        const wscols = [
            { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 25 }, { wch: 15 }
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, 'Reporte Gastos');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        
        const fileName = `Reporte_Gastos_Condominio_${yearDesde}-${monthDesde}_${yearHasta}-${monthHasta}.xlsx`;
        saveAs(dataBlob, fileName);
    };

    const exportToPDF = async () => {
        if (!reportData || !reportData.gastos || reportData.gastos.length === 0 || !reportRef.current) {
            alert('No hay datos o el elemento del reporte no está listo para exportar a PDF.');
            return;
        }

        setLoading(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                // Ignorar elementos no visibles para la impresión si hay algún overlay
                ignoreElements: (element) => {
                    // Ignorar los elementos con clase 'filters' y los botones
                    return element.closest('.filters') !== null || element.tagName === 'BUTTON';
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' para portrait, 'mm' para milímetros, 'a4' para tamaño de página

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const scaledWidth = imgWidth * ratio;
            const scaledHeight = imgHeight * ratio;

            // Centrar la imagen en la página (opcional)
            const x = (pdfWidth - scaledWidth) / 2;
            const y = (pdfHeight - scaledHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
            
            const fileName = `Reporte_Gastos_Condominio_${yearDesde}-${monthDesde}_${yearHasta}-${monthHasta}.pdf`;
            pdf.save(fileName);

        } catch (err) {
            console.error('Error al generar PDF:', err);
            setError('Error al generar el PDF: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const printReport = () => {
        window.print();
    };

    return (
        <div className="report-container">
            <h1>Reporte Detallado de Gastos</h1>

            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="yearDesde">Año Desde:</label>
                    <select id="yearDesde" value={yearDesde} onChange={(e) => setYearDesde(e.target.value)}>
                        {getYearOptions()}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="monthDesde">Mes Desde:</label>
                    <select id="monthDesde" value={monthDesde} onChange={(e) => setMonthDesde(e.target.value)}>
                        {meses.map(mes => (
                            <option key={mes.value} value={mes.value}>{mes.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="yearHasta">Año Hasta:</label>
                    <select id="yearHasta" value={yearHasta} onChange={(e) => setYearHasta(e.target.value)}>
                        {getYearOptions()}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="monthHasta">Mes Hasta:</label>
                    <select id="monthHasta" value={monthHasta} onChange={(e) => setMonthHasta(e.target.value)}>
                        {meses.map(mes => (
                            <option key={mes.value} value={mes.value}>{mes.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="tipoGasto">Tipo de Gasto:</label>
                    <select
                        id="tipoGasto"
                        value={selectedTipoGasto}
                        onChange={(e) => setSelectedTipoGasto(e.target.value)}
                    >
                        {tiposGasto.map(tipo => (
                            // El 'value' y 'key' ahora serán el nombre del tipo de gasto (VARCHAR2)
                            <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="nombreProveedor">Nombre Proveedor:</label>
                    <input
                        type="text"
                        id="nombreProveedor"
                        value={nombreProveedor}
                        onChange={(e) => setNombreProveedor(e.target.value)}
                        placeholder="Buscar por nombre de proveedor"
                    />
                </div>
                <button onClick={exportToExcel} className="btn btn-success">
                    Exportar a Excel
                </button>
                <button onClick={exportToPDF} className="btn btn-info">
                    Exportar a PDF
                </button>
                <button onClick={printReport} className="btn btn-secondary">
                    Imprimir Reporte
                </button>
            </div>

            {loading && <div className="loading-message">Cargando reporte...</div>}
            {error && <div className="error-message">Error: {error}</div>}

            {reportData && reportData.gastos && (
                <div className="report-content" ref={reportRef}> {/* Asignamos la referencia aquí */}
                    <div className="report-summary">
                        <h3>Resumen del Período</h3>
                        <p>Total de Gastos: <span>${(reportData.totalGastos ?? 0).toFixed(2)}</span></p>
                    </div>

                    <div className="report-table-container">
                        <h2>Detalle de Gastos</h2>
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Fecha Gasto</th>
                                    <th>Tipo Gasto</th>
                                    <th>Concepto</th>
                                    <th>Monto</th>
                                    <th>Proveedor</th>
                                    <th>NIT Proveedor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.gastos.length > 0 ? (
                                    reportData.gastos.map((gasto, index) => (
                                        <tr key={index}>
                                            <td>{gasto.fechaGasto}</td>
                                            <td>{gasto.tipoGasto}</td>
                                            <td>{gasto.concepto}</td>
                                            <td>${(gasto.monto ?? 0).toFixed(2)}</td>
                                            <td>{gasto.proveedorNombre}</td>
                                            <td>{gasto.proveedorNit}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No hay gastos para los filtros seleccionados.</td>
                                    </tr>
                                )}
                                <tr className="total-row">
                                    <td colSpan="3"><strong>TOTAL GENERAL DE GASTOS</strong></td>
                                    <td><strong>${(reportData.totalGastos ?? 0).toFixed(2)}</strong></td>
                                    <td colSpan="2"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReporteGastos;