import { useState, useRef, useEffect } from "react"
import {useIdrs} from "../hooks.js"
import { select } from 'd3-selection'
import { axisBottom, axisLeft } from 'd3-axis'
import { scaleLinear, scaleSequential } from 'd3-scale'
import { zoom } from 'd3-zoom'
import { line } from 'd3-shape'
import { interpolateViridis } from 'd3-scale-chromatic'

const IdrViewer = ({protein_seq_id}) => {
    const idrs = useIdrs(protein_seq_id)
    console.log(idrs.res);
    const svgRef = useRef();

    useEffect(() => {
        const svg = select(svgRef.current);

        const fldpnn_scores = idrs.res.map(val => parseFloat(val["Predicted Score for Disorder"])).filter(val => !Number.isNaN(val))
        //const disorder_blocks = fldpnn_scores.map((val, idx) => (val > 0.3) ? val : NaN).filter(val => !Number.isNaN(val))
        const disorder_blocks_idx = fldpnn_scores.map((val, idx) => (val > 0.3) ? idx : NaN).filter(val => !Number.isNaN(val))
        const disorder_blocks_rdp_p = idrs.res.map(val => parseFloat(val["rdp_p"])).filter(val => !Number.isNaN(val))
        const disorder_blocks_rdp_d = idrs.res.map(val => parseFloat(val["rdp_d"])).filter(val => !Number.isNaN(val))
        const disorder_blocks_rdp_r = idrs.res.map(val => parseFloat(val["rdp_r"])).filter(val => !Number.isNaN(val))
        const disorder_blocks_dfl = idrs.res.map(val => parseFloat(val["dfl"])).filter(val => !Number.isNaN(val))

        const block_width = Math.ceil((1000-100)/fldpnn_scores.length)

        const xScale = scaleLinear().domain([0, fldpnn_scores.length]).range([100, 1000]);
        const yScale = scaleLinear().domain([0, 1]).range([130, 10]);
        const xAxis = axisBottom(xScale);
        const yAxis = axisLeft(yScale);

        const colorScale = scaleSequential()
            .domain([1,0])
            .interpolator(interpolateViridis)
        
        const fldpnn_line = line()
            .x((val, idx) => xScale(idx))
            .y(val => yScale(val));

        const threshold_line = line()
            .x((val, idx) => xScale(idx))
            .y(yScale(0.3))

        svg.select(".x-axis").style("transform", "translateY(130px)").call(xAxis);
        svg.select(".y-axis").style("transform", "translateX(100px)").call(yAxis);

        svg
            .selectAll(".fldpnn-scores")
            .data([fldpnn_scores])
            .join("path")
            .attr("class", "fldpnn-scores")
            .attr("d", value => fldpnn_line(value))
            .attr("fill", "none")
            .attr("stroke", "black")

        svg
            .selectAll(".threshold-line")
            .data([fldpnn_scores])
            .join("path")
            .attr("class", "threshold-line")
            .attr("d", value => threshold_line(value))
            .attr("fill", "none")
            .attr("stroke", "black")
            .style("stroke-dasharray", ("3, 3"))
        
        svg
            .selectAll(".line_legend")
            .data(['fldpnn_score'])
            .join("path")
            .attr("class", "threshold-line")
            .attr("d", 'M900,8L920,8')
            .attr("stroke", "black")
        svg
            .selectAll(".line_legend")
            .data(['fldpnn_score'])
            .join("path")
            .attr("class", "threshold-line")
            .attr("d", 'M900,23L920,23')
            .attr("stroke", "black")
            .style("stroke-dasharray", ("3, 3"))
        svg
            .selectAll(".line_legend_labels")
            .data(['flDPnn score', 'threshold'])
            .join("text")
            .attr("x",  925)
            .attr("y", (v, idx) => [5, 20][idx]+6)
            .style("font-size", 12)
            .text(value => value)
        svg
            .selectAll(".xaxis_label")
            .data(['residue position'])
            .join("text")
            .attr("x",  5)
            .attr("y", 148)
            .style("font-size", 12)
            .text(value => value)

        svg
            .selectAll(".idr-blocks")
            .data(disorder_blocks_idx)
            .join("rect")
            .attr("x", value => xScale(value)-block_width/2)
            .attr("y", 170)
            .attr("width", block_width)
            .attr("height", 20)
            .attr("fill", "black")

        svg
            .selectAll(".drp_p_blocks")
            .data(disorder_blocks_idx)
            .join("rect")
            .attr("x", value => xScale(value)-block_width/2)
            .attr("y", 170+30)
            .attr("width", block_width)
            .attr("height", 20)
            .attr("fill", (val, idx) => colorScale(disorder_blocks_rdp_p[idx]))
        
        svg
            .selectAll(".drp_d_blocks")
            .data(disorder_blocks_idx)
            .join("rect")
            .attr("x", value => xScale(value)-block_width/2)
            .attr("y", 170+30+25)
            .attr("width", block_width)
            .attr("height", 20)
            .attr("fill", (val, idx) => colorScale(disorder_blocks_rdp_d[idx]))
        
        svg
            .selectAll(".drp_r_blocks")
            .data(disorder_blocks_idx)
            .join("rect")
            .attr("x", value => xScale(value)-block_width/2)
            .attr("y", 170+30+25*2)
            .attr("width", block_width)
            .attr("height", 20)
            .attr("fill", (val, idx) => colorScale(disorder_blocks_rdp_r[idx]))

        svg
            .selectAll(".dfl_blocks")
            .data(disorder_blocks_idx)
            .join("rect")
            .attr("x", value => xScale(value)-block_width/2)
            .attr("y", 170+30+25*3)
            .attr("width", block_width)
            .attr("height", 20)
            .attr("fill", (val, idx) => colorScale(disorder_blocks_dfl[idx]))
        
        svg
            .selectAll(".yaxis-label")
            .data(['probability of disorder'])
            .join("text")
            .attr("x",  60)
            .attr("y", 130)
            .style("font-size", 12)
            .text(value => value)
            .attr("transform", "rotate(-90,60,130)")

        svg
            .selectAll(".block_titles")
            .data(['IDRs'])
            .join("text")
            .attr("x",  0)
            .attr("y", 170+15)
            .style("font-size", 12)
            .text(value => value)

        svg
            .selectAll(".block_titles")
            .data(['protein binding', 'DNA binding', 'RNA binding', 'linker'])
            .join("text")
            .attr("x",  0)
            .attr("y", (value, idx) => 170+30+15+25*idx)
            .style("font-size", 12)
            .text(value => value)
        svg
            .selectAll(".block_titles")
            .data(['probability'])
            .join("text")
            .attr("x",  920)
            .attr("y", 170+48+25*5)
            .style("font-size", 12)
            .text(value => value)

        const legend_points = [...Array(10).keys()].map(d=> ({color:colorScale(d/10), value:d}))
        console.log(legend_points)
        const extent = [0, 9]

        const defs = svg.append("defs")
        var linearGradient = defs.append("linearGradient").attr("id", "viridisGradient")
        linearGradient.selectAll("stop")
            .data(legend_points)
            .enter().append("stop")
            .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
            .attr("stop-color", d => d.color);

        const g = svg.append("g").attr("transform", "translate(910,300)");
        g
            .append("rect")
            .attr("width", 80)
            .attr("height", 15)
            .style("fill", "url(#viridisGradient)");
        const legendTicks = [0.0, 0.5, 1.0]
        const legendScale = scaleLinear().domain([0, 1]).range([0, 80]);
        const legendAxis = axisBottom(legendScale)
            .tickSize(20)
            .tickValues(legendTicks)
        g
            .append("g")
            .call(legendAxis)
            .select(".domain")
            .remove()


    }, [idrs.res]);

    return (
    <div className="shadow-[0px_0px_6px_0px_rgba(0,0,0,0.2)] mt-3 mr-3 rounded p-3">
        <div className="border-b width-full border-slate-200">
            <p className="font-semibold">Predicted Intrinsically Disordered Regions</p>
        </div>
        <div className="flex justify-center mt-3">    
            <svg ref={svgRef} width="1000px" height="400px">
                <g className="x-axis" />
                <g className="y-axis" />
            </svg>
        </div>            
    </div>

    );
}

export default IdrViewer