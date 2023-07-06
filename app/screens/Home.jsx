import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import SearchInput from "../components/SearchInput.jsx";
import {OpenProtGlobalContext} from "../../main.jsx";


const Home = ({})=> {

    const navigate = useNavigate()

    const {setGlobalState} = useContext(OpenProtGlobalContext)

    const searchClick = (species_sn, query) => {

        const go = () => {
            setGlobalState({lastQuery: query})
            navigate(`/proteins/${species_sn}`)
        }

        setTimeout(go, 1)
    }


    return <>
        <SiteHeader/>
        <div className="grid grid-cols-3 grid-rows-9 gap-3 h-80">
            <div className={"col-start-2 row-start-2 mx-auto"}>
                <div className="text-4xl font-semibold mb-5">Explore the extended proteome</div>
                <SearchInput species_sn={"HS"} onSearchClick={searchClick}/>
            </div>
        </div>

        <div className="grid grid-cols-6 gap-4 my-2 w-full">
            <a href="" target="_blank" className="col-start-2 ">
            <div className="h-80 bg-[url('/img/files_img.png')] overflow-hidden">
                <h2 className="text-center text-4xl text-white font-semibold [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)] mt-5 ">Download</h2>
                <h3 className="text-center text-xl text-white font-semibold [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)]">Protein Libraries</h3>
                <small className="w-full block h-2/3 bg-slate-700/50 translate-y-1/3 p-3 text-white">
                    <span>Protein libraries in fasta format</span>
                </small>
            </div>
            </a>
            <a href="https://openprot.org/openvar/" target="_blank">
            <div className="h-80 bg-[url('/img/openvar_bg.png')] overflow-hidden">
                <h2 className="text-center text-4xl text-white font-semibold [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)] mt-5">Genetic Variants</h2>
                <h3 className="text-center text-xl text-white font-semibold [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)]">OpenVar</h3>
                <small className="w-full block h-2/3 bg-slate-700/50 translate-y-1/3 p-3 text-white">
                    <span>OpenVar annotates the effect of genetic variants on proteins. Use your VCF formated variant data to see how reference and alternative protein sequences are affected.</span>
                </small>
            </div>
            </a>
            <a href="https://openprot.org/opencustomdb/" target="_blank">
            <div className="h-80 bg-[url('/img/opencdb_bg.png')] overflow-hidden">
                <h2 className="text-center text-4xl text-white font-semibold [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)] mt-5">Proteogenomics Tool</h2>
                <h3 className="text-center text-xl text-white font-semibold [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)]">OpenCustomDB</h3>
                <small className="w-full block h-2/3 bg-slate-700/50 translate-y-1/3 p-3 text-white">
                    <span>OpenCustomDB produces customized protein libraries taking into account the results of RNA sequencing data. Use your VCF formated variant data to obtain customized protein libraries for mass spectrometry analysis.</span>
                </small>
            </div>
            </a>
            <a href="https://seb-leb.github.io/altprot-ppi/" target="_blank">
            <div className="h-80 bg-[url('/img/ppi_bg.png')] overflow-hidden">
                <h2 className="text-center text-4xl text-white font-semibold [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)] mt-5">Network Proteomics</h2>
                <h3 className="text-center text-xl text-white font-semibold [text-shadow:_0_4px_4px_rgb(0_0_0_/_40%)]">protein-protein interactions</h3>
                <small className="w-full block h-2/3 bg-slate-700/50 translate-y-1/3 p-3 text-white">
                    <span>Alternative proteins have been identified in a large network of protein protein interactions.</span>
                </small>
            </div>
            </a>

            <div className="col-start-2 col-span-4 p-3 my-2 bg-gray-200">
                <h2 className="text-2xl m-2 font-semibold">The concept behind OpenProt</h2>
                <div className="grid grid-cols-2">
                    <div className="m-2">
                    <h3 className="text-lg my-2 font-semibold">Current annotations</h3>
                    Current genome annotations hold limiting criteria for Open Reading Frames (ORF) including a minimal ORF length of 100 codons and a single ORF per transcript. Transcripts that do not meet these criteria are labeled non-coding (ncRNAs) and transcripts from unprocessed pseudogenes are also systematically annotated non-coding.
                    </div>
                    <div className="m-auto">
                    <img src="/img/current_model.png" width="500"/>
                    </div>
                    <div className="m-2 mt-8">
                    <h3 className="text-lg my-2 font-semibold">OpenProt annotations</h3>
                    OpenProt relaxes traditional annotation criteria by including all ORFs longer than 30 codons and allowing multiple ORFs per transcript as well as those encoded in ncRNAs and transcripts of pseudogenes. OpenProt offers a deeper description and thus a more realistic and biologically relevant perspective of the proteome.                    </div>
                    <div className="mx-auto mt-8">
                    <img src="/img/OpenProt_model.png" width="500"/>
                    </div>
                </div>
            </div>

            <div className="col-start-2 col-span-4 my-2 p-3 bg-gray-200">
                <h2 className="text-2xl m-2 font-semibold">OpenProt discoveries: re-interpret already acquired data</h2>
                <div className="m-2">
                    The annotation of sequences is central to current research in biomolecular sciences. The addition of unannotated protein sequences in the OpenProt protein library has resulted in many important discoveries in the human proteome through the re-analysis of publicly available data. Many of these have been selected for further investigation:
                </div>
                <div className="grid grid-cols-2 mx-8">
                    <ul className="list-disc m-5">
                        <li>
                            <p>The FUS gene is dual-coding with both proteins contributing to FUS-mediated toxicity. <a className="text-blue-800" href="https://doi.org/10.15252/embr.202050640" target="_blank">https://doi.org/10.15252/embr.202050640</a></p>
                        </li>
                        <li>
                            <p>The Protein Coded by a Short Open Reading Frame, Not by the Annotated Coding Sequence, Is the Main Gene Product of the Dual-Coding Gene MIEF1. <a className="text-blue-800" href="https://doi.org/10.1074/mcp.RA118.000593" target="_blank">https://doi.org/10.1074/mcp.RA118.000593</a></p>
                        </li>
                        <li>
                            <p>Potentiation of B2 receptor signaling by AltB2R, a newly identified alternative protein encoded in the human bradykinin B2 receptor gene. <a className="text-blue-800" href="https://doi.org/10.1016/j.jbc.2021.100329" target="_blank">https://doi.org/10.1016/j.jbc.2021.100329</a></p>
                        </li>
                    </ul>
                    <ul className="list-disc m-5">
                        <li>
                            <p>UBB pseudogene 4 encodes functional ubiquitin variants. <a className="text-blue-800" href="https://doi.org/10.1038/s41467-020-15090-6" target="_blank">https://doi.org/10.1038/s41467-020-15090-6</a></p>
                        </li>
                        <li>
                            <p>An overlapping reading frame in the PRNP gene encodes a novel polypeptide distinct from the prion protein. <a className="text-blue-800" href="https://doi.org/10.1096/fj.10-173815" target="_blank">https://doi.org/10.1096/fj.10-173815</a></p>
                        </li>
                        <li>
                            <p>An out-of-frame overlapping reading frame in the ataxin-1 coding sequence encodes a novel ataxin-1 interacting protein. <a className="text-blue-800" href="https://doi.org/10.1074/jbc.M113.472654" target="_blank">https://doi.org/10.1074/jbc.M113.472654</a></p>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="col-start-2 col-span-4 p-3 my-2 bg-gray-200">
                <h2 className="text-2xl m-2 font-semibold">The OpenProt pipeline</h2>
                <div className="grid grid-cols-2">
                    <div className="m-auto">
                    <img src="/img/OpenProt_pipeline.png" width="350"/>
                    </div>                    
                    <div className="m-2">
                    <h3 className="text-lg my-2 font-semibold">Prediction pipeline</h3>
                    The OpenProt ORF prediction pipeline starts from an exhaustive description of the transcriptome consisting of all RNA transcripts reported by both Ensembl and NCBI RefSeq. A 3-frame in silico translation then yields the ORFeome: any ORF longer than 30 codons in any frame of any transcript. This ORFeome is then filtered to categorize predicted ORFs. The first filter retrieves all known proteins, or reference proteins (all ORF already annotated in Ensembl, NCBI RefSeq, and/or UniProtKB). The second filter is based on the homology of currently not annotated ORFs with the refProt of the same gene (if applicable), and retrieves novel predicted isoforms. The remaining ORFs encode novel proteins, called alternative proteins (altProts).</div>
                    <div className="mx-auto mt-8">
                    <img src="/img/OpenProt_evidence_pipeline.png" width="350"/>
                    </div>
                    <div className="m-2 mt-8">
                    <h3 className="text-lg my-2 font-semibold">Evidence pipeline</h3>
                    <ul className="list-disc m-5">
                        <li>
                            <span className="font-semibold">Conservation evidence</span>: for every ORF annotated, OpenProt identifies orthologs and paralogs (across the 10 species currently supported by OpenProt).
                        </li>
                        <li>
                            <span className="font-semibold">Translation evidence</span>: Publicly available ribosome profiling datasets are re-analysed using the Price algorithm. This gathers translation evidence for any ORF annotated in OpenProt.
                        </li>
                        <li>
                            <span className="font-semibold">Expression evidence</span>: Publicly available mass spectrometry datasets are re-analysed using multiple search engines. This gathers expression evidence for any ORF annotated in OpenProt.
                        </li>
                    </ul>
                    </div>
                </div>
            </div>
        </div>
    <SiteFooter/>
  </>
}

export default Home