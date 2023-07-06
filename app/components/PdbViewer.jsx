import {use3DMolViewer} from "../hooks.js";
const PdbViewer = ({protein_seq_id}) => {

    const {viewerElementRef, pdbNotFound} = use3DMolViewer({protein_seq_id})

    return (
        <div className="shadow-[0px_0px_6px_0px_rgba(0,0,0,0.2)] mt-3 mr-3 rounded p-3">
            {
                pdbNotFound ?
                    <div>No PDB for protein {protein_seq_id}</div> :
                    <div className="border-b width-full border-slate-200">
                        <p className="font-semibold">Structure</p>
                    </div>
            }
            <div className="grid grid-cols-4">
                { 
                    pdbNotFound ?
                    "":
                <div className="m-auto">
                    <img src="/img/plddt_legend.svg" width="160" />
                </div>                    
                }

                <div className="grid-colspan-3">
                    <div ref={viewerElementRef} style={{width:500, height: 400, display: pdbNotFound ? 'none': null}}></div>
                </div>
            </div>
            
            
        </div>
    );
}

export default PdbViewer
