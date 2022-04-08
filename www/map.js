/*
 * query args
 */
function get_query_args() {
    var i=0;
    var telem;
    var search_values=location.search.replace('\?','').split('&');
    var query={}
    for(i=0;i<search_values.length;i++){
        telem=search_values[i].split('=');
        query[telem[0]]=decodeURIComponent(telem[1]);
    }

    return query;
}
/*
 * display map
 */
function sum_bounding_box(b1, b2) {
    b = [
        [Math.min(b1[0][0], b2[0][0]), Math.min(b1[0][1], b2[0][1])],
        [Math.max(b1[1][0], b2[1][0]), Math.max(b1[1][1], b2[1][1])],
    ]
    return b
}
function display_map(source, container) {
    d3.json(source, function(error, fr) {
        var width = 420;
        var height = 500;

        var svg = d3.select(container).append("svg")
            .attr("width", width)
            .attr("height", height)

        var projection = d3.geo.mercator()
            .scale(1)
            .translate([0, 0])

        var path = d3.geo.path()
            .projection(projection);

        var regions = topojson.feature(fr, fr.objects.fr_regions);

        var b = path.bounds(regions.features[0]);
        for (f in regions.features) {
            b = sum_bounding_box(b, path.bounds(regions.features[f]))
        }

        var s = .95 / Math.max(
            (b[1][0] - b[0][0]) / width,
            (b[1][1] - b[0][1]) / height)

        var t = [
            (width - s * (b[1][0] + b[0][0])) / 2,
            (height - s * (b[1][1] + b[0][1])) / 2]

        projection
          .scale(s)
          .translate(t)

        var radiuses = regions.features.map(function (d) { return Math.sqrt(d.properties.tweets)})

        var rscale = d3.scale.linear()
          .domain([0,d3.max(radiuses)])
          .range([0,35])

        var ramp = d3.scale.linear()
            .domain([0,d3.max(radiuses)])
            .range(["yellow","red"]);

        groups = svg.selectAll("g")
            .data(regions.features.sort(function (a, b) {
                return a.properties.tweets > b.properties.tweets
            }))
            .enter()
            .append("g")
            .attr("class", "region")
            .on('click', function(d) {
                window.location.href='dashboard_region.html?region='+d.id+'&name='+encodeURIComponent(d.properties.name);
            })

        groups.append("path")
            .attr("d", path)
            .style("stroke", "black")

        groups.append("circle")
            .attr("cx", function (d) { return path.centroid(d)[0]; })
            .attr("cy", function (d) { return path.centroid(d)[1]; })
            .attr("r", function(d) { return rscale(Math.sqrt(d.properties.tweets)) })
            .attr("fill", function(d) { return ramp(Math.sqrt(d.properties.tweets)) })
            .style("stroke", "black")
    });
}
