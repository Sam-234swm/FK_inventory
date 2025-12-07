let rawData = [];

document.getElementById("fileInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rawData = XLSX.utils.sheet_to_json(sheet);

        populateFilters();
        renderCharts(rawData);
    };

    reader.readAsArrayBuffer(file);
});

function populateFilters() {
    const citySelect = document.getElementById("cityFilter");
    citySelect.innerHTML = "<option value=''>All</option>";

    const cities = [...new Set(rawData.map(row => row.City))];

    cities.forEach(city => {
        citySelect.innerHTML += `<option value="${city}">${city}</option>`;
    });

    // Auto-set date limits
    const dates = rawData.map(row => dayjs(row.Date));
    document.getElementById("startDate").value = dates[0].format("YYYY-MM-DD");
    document.getElementById("endDate").value = dates[dates.length - 1].format("YYYY-MM-DD");
}

function applyFilters() {
    const city = document.getElementById("cityFilter").value;
    const start = dayjs(document.getElementById("startDate").value);
    const end = dayjs(document.getElementById("endDate").value);

    const filtered = rawData.filter(row => {
        const d = dayjs(row.Date);
        return (!city || row.City === city) && d >= start && d <= end;
    });

    renderCharts(filtered);
}

function renderCharts(data) {
    // Chart 1 – City-wise Forward Overall
    Plotly.newPlot("chart1", [{
        x: data.map(r => r.City),
        y: data.map(r => r.Forward_Overall),
        type: "bar"
    }], { title: "Forward Overall by City" });

    // Chart 2 – Trend
    Plotly.newPlot("chart2", [{
        x: data.map(r => r.Date),
        y: data.map(r => r.Forward_Overall),
        mode: "lines+markers"
    }], { title: "Inventory Trend Over Time" });

    // Chart 3 – Category Split
    Plotly.newPlot("chart3", [{
        labels: data.map(r => r.Category),
        values: data.map(r => r.Forward_Overall),
        type: "pie"
    }], { title: "Category Split" });
}
