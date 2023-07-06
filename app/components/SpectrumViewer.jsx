import { useState, useReducer, useRef, useEffect } from "react"
import { select } from 'd3-selection'
import { axisBottom, axisLeft } from 'd3-axis'
import { scaleLinear } from 'd3-scale'
import { zoom } from 'd3-zoom'
import { useFetchProtPsms, useFetchPsm } from '../hooks.js'
import Select from "../widgets/Select.jsx";

const margin = {top: 50, right: 30, bottom: 20, left: 40}
const width = 1000 - margin.left - margin.right
const height = 300 - margin.top - margin.bottom

const decoratedlist = (label, data) =>
<div className="flex">
    <div className="m-1 w-1/3 pr-1 text-right border-r-2 border-slate-400 text-sm">
        {label}
    </div>
    <div className="m-auto ml-1">{data}</div>
</div>

const SpectrumViewer = ({species_sn, protein_seq_id}) => {

    const {isReady, prot_psms} = useFetchProtPsms({species_sn, protein_seq_id})

    const pmsStateReducer = (state, action) => {
      const { type, payload } = action;
      switch (type) {
        case 'init':{
          return {
            selected_psm: {
              study_id: "",
              peptide_seq: "",
              scan_number: "",
              psm_id: -1
            },
            psms: [],
            spectrum: {},
            spectrum_annotation: {},
            studies: [],
            filteredPeptides: [],
            filteredSpectra: [],
          }
        }
        case 'load_psms':{
          if (payload.length <1) {
            return {...state}
          }
          const best_psm = payload.reduce((prev, current) => (prev.psm_score > current.psm_score) ? prev : current)
          return {
            ...state,
            psms: payload,
            studies: Array.from(new Set(payload.map((item) => item.study_id))),
            filteredPeptides: Array.from(new Set(payload.filter((c) => c.study_id === best_psm.study_id).map(item => item.peptide_seq))),
            filteredSpectra: payload.filter((c) => c.study_id === best_psm.study_id & c.peptide_seq === best_psm.peptide_seq).map(item => item.scan_number),
            selected_psm: best_psm,
          };
        }
        case 'select_study': {
          const filteredPeptides = Array.from(new Set(state.psms.filter((c) => c.study_id === payload.value).map(item => item.peptide_seq)))
          const filteredSpectra = state.psms.filter((c) => c.study_id === payload.value & filteredPeptides.includes(c.peptide_seq)).map(item => item.scan_number)
          const selected_psm = state.psms.filter((c) => filteredSpectra.includes(c.scan_number)).reduce((prev, current) => (prev.psm_score > current.psm_score) ? prev : current)
          return {
            ...state,
            filteredPeptides: filteredPeptides,
            filteredSpectra: filteredSpectra,
            selected_psm: selected_psm,
          };
        }
        case 'select_peptide': {
          const filteredSpectra = state.psms.filter((c) => c.study_id === state.selected_psm.study_id & c.peptide_seq === payload.value).map(item => item.scan_number)
          const selected_psm = state.psms.filter((c) => filteredSpectra.includes(c.scan_number)).reduce((prev, current) => (prev.psm_score > current.psm_score) ? prev : current)
          return {
            ...state,
            peptide_seq: payload.value,
            filteredSpectra: filteredSpectra,
            selected_psm: selected_psm,
          };
        }
        case 'select_spectrum': {
          return {
            ...state,
            selected_psm: state.psms.filter((c) => c.scan_number === payload.value)[0],
          };
        }
        default:
          return { ...state };
      }
    };

    const [psmStateView, dispatchPsmStates] = useReducer(pmsStateReducer, pmsStateReducer(null, {type:'init', payload:null}));

    useEffect(() => {dispatchPsmStates({type: 'load_psms', payload: prot_psms})}, [isReady]);

    const {isReady:psmIsReady, psm, fetchPsm} = useFetchPsm()

    useEffect(() => {
      if (psmStateView.selected_psm.psm_id !== -1) {
        
        fetchPsm(species_sn, psmStateView.selected_psm.psm_id)
      }
    }, [psmStateView.selected_psm.psm_id])

    const [currentZoomState, setCurrentZoomState] = useState();
    const svgRef = useRef();

    useEffect(() => {
      if (!psmIsReady){
        return;
      }
      const spectrum = psm.spectrum
      const spectrum_annotation = psm.spec_ann

      const svg = select(svgRef.current);
      const xScale = scaleLinear().domain(
          [Math.min(...spectrum["m/z"]), Math.max(...spectrum["m/z"])]
        ).range([margin.left, width]);

      if (currentZoomState) {
        const newXScale = currentZoomState.rescaleX(xScale);
        xScale.domain(newXScale.domain());
      }

      const yScale = scaleLinear().domain([0, 1]).range([height, margin.top]);

      const xAxis = axisBottom(xScale);
      const yAxis = axisLeft(yScale);
      svg.select(".x-axis").style("transform", "translateY("+height+"px)").call(xAxis);
      svg.select(".y-axis").style("transform", "translateX("+margin.left+"px)").call(yAxis);

      function getRelInt(intensity) {
        return (intensity / Math.max(...spectrum.intensity));
      }

      function getPeaksD(mz, intensity) {
        return (`M${xScale(mz)},${yScale(0)}L${xScale(mz)},${yScale(getRelInt(intensity))}`);
      }

      function getPeakColor(data) {
        switch (data.Subtype) {
          case "y":
            return ("red");
          case "b":
            return ("blue");
        }
      }

      svg
        .selectAll(".peak-bg")
        .data(spectrum["m/z"])
        .join("path")
        .attr("class", "peak-bg")
        .attr("d", (value, idx) => getPeaksD(value, spectrum.intensity[idx]))
        .attr("fill", "none")
        .attr("stroke", "grey");
        
      svg
        .selectAll(".tooltip-ion-name")
        .data(spectrum_annotation.peak_anns)
        .join("text")
        .attr("class", "tooltip-ion-name")
        .text(value => value.Name)
        .attr("text-anchor", "middle")
        .style("fill", value => getPeakColor(value))
        .attr("x", value => xScale(value["m/z"]))
        .attr("y", value => yScale(getRelInt(value.Intensity)) - 8)
        .on("mouseenter", value => {
          svg
            .selectAll(".tooltip-bg")
            .data([value])
            .join("rect")
            .attr("class", "tooltip-bg")
            .attr("width", 150)
            .attr("height", 50)
            .attr("fill", "white")
            .attr("x", xScale(value.srcElement.__data__["m/z"]) + 18)
            .attr("y", yScale(getRelInt(value.srcElement.__data__.Intensity)) - 38);
          svg
            .selectAll(".tooltip-charge")
            .data([value])
            .join("text")
            .attr("class", "tooltip-charge")
            .text(`charge: ${value.srcElement.__data__["Fragment Charge"]}+`)
            .attr("x", xScale(value.srcElement.__data__["m/z"]) + 18)
            .attr("y", yScale(getRelInt(value.srcElement.__data__.Intensity)) - 24);
          svg
            .selectAll(".tooltip-mz")
            .data([value])
            .join("text")
            .attr("class", "tooltip-mz")
            .text(`m/z: ${value.srcElement.__data__["m/z"]}`)
            .attr("x", xScale(value.srcElement.__data__["m/z"]) + 18)
            .attr("y", yScale(getRelInt(value.srcElement.__data__.Intensity)) - 8);
          svg
            .selectAll(".tooltip-abundance")
            .data([value])
            .join("text")
            .attr("class", "tooltip-abundance")
            .text(`rel. abundance: ${Math.round(getRelInt(value.srcElement.__data__.Intensity) * 100)/100}`)
            .attr("x", xScale(value.srcElement.__data__["m/z"]) + 18)
            .attr("y", yScale(getRelInt(value.srcElement.__data__.Intensity)) + 8);
        })
        .on("mouseleave", () => {
          svg.select(".tooltip-charge").remove();
          svg.select(".tooltip-mz").remove();
          svg.select(".tooltip-abundance").remove();
          svg.select(".tooltip-bg").remove();
        });

      svg
        .selectAll(".peak-ann")
        .data(spectrum_annotation.peak_anns)
        .join("path")
        .attr("class", "peak-ann")
        .attr("d", value => getPeaksD(value["m/z"], value.Intensity))
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .attr("stroke", value => getPeakColor(value))
        .on("mouseenter", value => {
          svg
            .selectAll(".tooltip-charge")
            .data([value])
            .join("text")
            .attr("class", "tooltip-charge")
            .text(`charge: ${value.srcElement.__data__["Fragment Charge"]}+`)
            .attr("x", xScale(value.srcElement.__data__.mz) + 18)
            .attr("y", yScale(getRelInt(value.srcElement.__data__.Intensity)) - 24);
          svg
            .selectAll(".tooltip-mz")
            .data([value])
            .join("text")
            .attr("class", "tooltip-mz")
            .text(`m/z: ${value.srcElement.__data__.mz}`)
            .attr("x", xScale(value.srcElement.__data__.mz) + 18)
            .attr("y", yScale(getRelInt(value.srcElement.__data__.Intensity)) - 8);
          svg
            .selectAll(".tooltip-abundance")
            .data([value])
            .join("text")
            .attr("class", "tooltip-abundance")
            .text(`rel. abundance: ${Math.round(getRelInt(value.srcElement.__data__.Intensity) * 100)/100}`)
            .attr("x", xScale(value.srcElement.__data__.mz) + 18)
            .attr("y", yScale(getRelInt(value.srcElement.__data__.Intensity)) + 8);
        })
        .on("mouseleave", () => {
          svg.select(".tooltip-charge").remove();
          svg.select(".tooltip-mz").remove();
          svg.select(".tooltip-abundance").remove();
        });

      svg
        .selectAll('.x-axis-label')
        .data(['m/z'])
        .join('text')
        .attr('class', 'x-axis-label')
        .attr('x', width/2)
        .attr('y', height + 28)
        .text(v => v)
      svg
        .selectAll('.y-axis-label')
        .data(['rel. intensity'])
        .join('text')
        .attr('class', 'y-axis-label')
        .attr('x', 10)
        .attr('y', height/2 + 60 )
        .text(v => v)
        .attr('transform', `rotate(-90,10,${height/2 + 60})`)
        

      const peptide_position = {
        "x":width - (spectrum_annotation.Sequence.length * 18), 
        "y":12
      };

      svg
        .selectAll(".peptide-frag")
        .data(spectrum_annotation.Sequence)
        .join("text")
        .attr("class", "peptide-frag")
        .attr("fill", "black")
        .attr("x", (value, index) => peptide_position.x + index * 18)
        .attr("y", peptide_position.y)
        .attr("text-anchor", "middle")
        .attr("font-family", "Courier")
        .style("font-size", 16)
        .text(value => value);
      
      function getSeparator(p_ann) {
        switch (p_ann.Subtype) {
          case 'b':// top blue
            var i = p_ann.Number -1
            return (`M${peptide_position.x + 3 + 18*i},${0}L${peptide_position.x + 9 + 18*i},${3}L${peptide_position.x + 9 + 18*i},${10}`);

          case 'y':// bottom red
            var i = spectrum_annotation.Sequence.length - p_ann.Number -1
            return (`M${peptide_position.x + 9 + 18*i},${10}L${peptide_position.x + 9 + 18*i},${18}L${peptide_position.x + 15 + 18*i},${21}`);
        }
      }

      const yb = /y|b/;

      svg
        .selectAll(".frag-sep")
        .data(spectrum_annotation.peak_anns.filter(p => yb.test(p.Name)))
        .join("path")
        .attr("class", "frag-sep")
        .attr("d", value => getSeparator(value)) 
        .attr("fill", "none")
        .attr("stroke", value => getPeakColor(value));
      
      const zoomBehavior = zoom()
        .scaleExtent([1, 5])
        .translateExtent([[0,0], [width, height]])
        .on("zoom", (event) => {
          const zoomState = event.transform;
          setCurrentZoomState(zoomState);
        });
      
      zoomBehavior(svg);

    }, [currentZoomState, prot_psms, psm]);
    
    if (!isReady) {
      return <span>Loading</span>
    };

    return ( 
      <div className="shadow-[0px_0px_6px_0px_rgba(0,0,0,0.2)] rounded p-3 mt-3 mr-3">
        <div className="border-b width-full border-slate-200">
          <p className="font-semibold">Mass Spectrometry</p>
        </div>

        <div className="grid grid-cols-5 mt-5 w-full ml-2">

          <div className="">
              <Selector
          items={psmStateView.studies}
          label={"Study"}
          selectedItem={psmStateView.selected_psm.study_id}
          onChange={e =>
            dispatchPsmStates({
                type: 'select_study',
                payload: { value: e},
              })
            }
          /></div>
          <div className=""><Selector
              label={"Peptide"}
          items={psmStateView.filteredPeptides}
          selectedItem={psmStateView.selected_psm.peptide_seq}
          onChange={e =>
            dispatchPsmStates({
                type: 'select_peptide',
                payload: { value: e},
              })
            }
          /></div>
          <div className=""><Selector
              label={"Spectrum"}
          items={psmStateView.filteredSpectra}
          selectedItem={psmStateView.selected_psm.scan_number}
          onChange={e =>
            dispatchPsmStates({
                type: 'select_spectrum',
                payload: { value: e },
              })
            }
          /></div>
          <div className="col-span-2">
              {decoratedlist('PSM score', psmStateView.selected_psm.psm_score)}
              {decoratedlist('PEP', psmStateView.selected_psm.pep)}
              {decoratedlist('experiment', psmStateView.selected_psm.experiment_id)}
          </div>
        </div>  
          <svg ref={svgRef} width={width} height={height + margin.top + margin.bottom}>
            <g className="x-axis" />
            <g className="y-axis" />
          </svg>
      </div>
    );
}

const Selector = ({label, items, selectedItem, onChange}) =>
    <Select
        label={label}
        onChange={e => onChange(e.target.value)}
        value={selectedItem}
    >
      {
        items.map((item) => (
            <option key={item} value={item}>
                {item}
            </option>
        ))
      }
    </Select>

export default SpectrumViewer