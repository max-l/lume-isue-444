import { useState, useRef, useEffect } from "react"
import { select } from 'd3-selection'
import { group, bin } from 'd3-array'
import { area, curveBumpY } from 'd3-shape'
import { axisBottom, axisLeft } from 'd3-axis'
import { scaleLinear, scaleBand } from 'd3-scale'
import { useFetchGtex } from '../hooks.js'

const colors = {
    "Adipose_Subcutaneous": "#FFB27F",
    "Adipose_Visceral": "#FFD47F",
    "Adrenal_Gland": "#99EE99",
    "Artery_Aorta": "#FFAAAA",
    "Artery_Coronary": "#FFD4CC",
    "Artery_Tibial": "#FF7F7F",
    "Bladder": "#D47F7F",
    "Brain_Amygdala": "#F6F67F",
    "Brain_Anterior_cingulate_cortex": "#F6F67F",
    "Brain_Caudate": "#F6F67F",
    "Brain_Cerebellar_Hemisphere": "#F6F67F",
    "Brain_Cerebellum": "#F6F67F",
    "Brain_Cortex": "#F6F67F",
    "Brain_Frontal_Cortex": "#F6F67F",
    "Brain_Hippocampus": "#F6F67F",
    "Brain_Hypothalamus": "#F6F67F",
    "Brain_Nucleus_accumbens": "#F6F67F",
    "Brain_Putamen": "#F6F67F",
    "Brain_Spinal_cord": "#F6F67F",
    "Brain_Substantia_nigra": "#F6F67F",
    "Breast_Mammary_Tissue": "#99E5E5",
    "Cells_Cultured_fibroblasts": "#D4F6FF",
    "Cells_EBV_transformed_lymphocytes": "#E5B2FF",
    "Cervix_Ectocervix": "#FFE5E5",
    "Cervix_Endocervix": "#E5D4EE",
    "Colon_Sigmoid": "#F6DDBB",
    "Colon_Transverse": "#E5CCAA",
    "Esophagus_Gastroesophageal_Junction": "#C5B9AA",
    "Esophagus_Mucosa": "#AA907F",
    "Esophagus_Muscularis": "#DDCCC3",
    "Fallopian_Tube": "#FFE5E5",
    "Heart_Atrial_Appendage": "#CC7FFF",
    "Heart_Left_Ventricle": "#99FFE0",
    "Kidney_Cortex": "#90FFEE",
    "Kidney_Medulla": "#99FFE0",
    "Liver": "#D4DDB2",
    "Lung": "#CCFF7F",
    "Minor_Salivary_Gland": "#CCDDC3",
    "Muscle_Skeletal": "#D4D4FF",
    "Nerve_Tibial": "#FFEB7F",
    "Ovary": "#FFD4FF",
    "Pancreas": "#CCAA90",
    "Pituitary": "#D4FFCC",
    "Prostate": "#EEEEEE",
    "Skin_Not_Sun_Exposed": "#7F7FFF",
    "Skin_Sun_Exposed": "#BBBBFF",
    "Small_Intestine_Terminal_Ileum": "#AAAA90",
    "Spleen": "#BBC3AA",
    "Stomach": "#FFEECC",
    "Testis": "#D4D4D4",
    "Thyroid": "#7FB27F",
    "Uterus": "#FFB2FF",
    "Vagina": "#FFAACC",
    "Whole_Blood": "#FF7FDD"
    }

const margin = {top: 30, right: 30, bottom: 30, left: 40}
const width = 1400 - margin.left - margin.right
const height = 300 - margin.top - margin.bottom

/*
*
* titleFunc: accession => title
* */
const paintSvg = (svg, {gtex, accession}, titleFunc) => {

    const data = gtex

    svg.selectAll('*').remove()

    const max_x0 = Math.max.apply(null, Object.values(data).map((d, idx) => Math.max.apply(null, d)))

    const yScale = scaleLinear().domain([0, max_x0]).range([height, 0])
    const yAxis = axisLeft(yScale)

    const band_width = 22
    function getViolin(data, idx) {
        const wScale = scaleLinear().domain([0, data.length]).range([(band_width*idx), (band_width*idx)+20])
        const areaBuilder = area()
            .x0((d) => wScale(-d.length))
            .x1((d) => wScale(d.length))
            .y((d) => yScale(d.x0))
            .curve(curveBumpY)
        const binsGenarator = bin().thresholds(12)
        const bins = binsGenarator(data)
        return areaBuilder(bins)
    }

    //svg.select(".y-axis").style("transform", "translate(30px,"+ margin.top +"px)").call(yAxis)

    svg
        .selectAll(".title")
        .data([titleFunc(accession)])
        .join("text")
        .attr("x", 40)
        .attr("y", 20)
        .text(v => v)



    const g = svg.append("g").attr(
        "transform", "translate(" + margin.left + "," + margin.top + ")"
    )

    svg.append("g").attr(
        "transform", "translate(30,"+ margin.top +")"
    ).call(yAxis)

    g
        .selectAll(".violin")
        .data(Object.entries(data))
        .join("path")
        .attr("class", "violin")
        .attr("d", ([t, d], idx) => getViolin(d, idx))
        .attr("fill", ([t, d], idx) => colors[t])

    g
        .selectAll(".violin_label")
        .data(Object.entries(data))
        .join("text")
        .attr("class", "violin_label")
        .attr("y", height+12)
        .attr("x", ([t, d], idx) => idx*band_width)
        .attr("transform", ([t, d], idx) => "rotate(30,"+ idx*band_width +","+ height +")")
        .style("font-size", "11px")
        .text(([t, d], idx) => t)

    g
        .selectAll(".x-axis")
        .data([0])
        .join("path")
        .attr("class", "x-axis")
        .attr("d", "M-10,"+height+"L1200,"+height)
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("stroke-width", .5)

    g
        .selectAll(".y-axis-label")
        .data(['TPM'])
        .join("text")
        .attr("y", 150)
        .attr("x", -32)
        .attr("transform", "rotate(-90,-32,150)")
        .style("font-size", "11px")
        .text(v => v)
}

const TranscriptExpression = ({transcript}) => {

    const { setSVGNode } = useFetchGtex({transcript, paintSvg})
    
    const svgRef = useRef()

    useEffect(() => {
        const svg = select(svgRef.current)
        setSVGNode(svg)
    }, [])

    return (
        <div className="mt-5">
            <svg ref={svgRef} width={width+100} height={height+140}>
                <g className="y-axis" />
            </svg>
        </div>
    );
}

export default TranscriptExpression