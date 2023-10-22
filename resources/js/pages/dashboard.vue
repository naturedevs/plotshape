<template>
    <div class="w-100 h-100">
    
        <div style="margin:0 auto; width: fit-content;height: 40px;display: flex; align-items: center;">
    
            <input type='file' id="csvfile-input" accept=".csv" style="display:none">
    
            <input type="file" style="display:none" id="shapefile-input" accept=".zip, .shp" />
    
            <!-- <input type="file" id="csvfile-input" accept=".csv" /> -->
    
            <button class="mx-4" style="display:block;width:120px; height:30px;" onclick="document.getElementById('shapefile-input').click()">Open Shape</button>
    
            <button class="mx-4" style="display:block;width:120px; height:30px;" onclick="document.getElementById('csvfile-input').click()">Import CSV</button>
    
            <button class="mx-4" id="exportCsvBtn" style="display:block;width:120px; height:30px;">Export CSV</button>
    
            <button class="mx-4" id="clearBtn" style="display:block;width:120px; height:30px;">Clear</button>
    
        </div>
    
        <div id="mapApp" class="w-100" style="height: calc(100% - 40px);"></div>
    
    </div>
</template>
<style>
@import '../../csslib/leaflet.css';
</style>
<script>
export default {

    data: () => ({
        title: window.config.appName,
        message: "test"
    }),

    mounted() {
        const plugin1 = document.createElement("script");
        const plugin2 = document.createElement("script");
        const plugin3 = document.createElement("script");
        const plugin4 = document.createElement("script");
        const plugin5 = document.createElement("script");
        plugin1.setAttribute(
            "src", "/jslib/shp.js"
        );
        plugin1.async = false;
        plugin2.setAttribute(
            "src", "/jslib/leaflet.js"
        );
        plugin2.async = false;
        plugin3.setAttribute(
            "src", "/jslib/turf.js"
        );
        plugin3.async = false;
        plugin4.setAttribute(
            "src", "/js/map.js"
        );
        plugin4.async = false;
        plugin5.setAttribute(
            "src", "/jslib/papaparse.js"
        );
        plugin5.async = false;
        document.getElementById('mapApp').appendChild(plugin1);
        document.getElementById('mapApp').appendChild(plugin2);
        document.getElementById('mapApp').appendChild(plugin3);
        document.getElementById('mapApp').appendChild(plugin4);
        document.getElementById('mapApp').appendChild(plugin5);
    }
}
</script>
