import React, { useMemo, useState, useEffect } from "react";
import {
    useReactTable,
    getCoreRowModel,
    createColumnHelper,
    flexRender
} from 'react-table'

import {SpinnerSvg} from "../widgets/Spinner.jsx";
import {useDownloads} from "../hooks.js";
import ScreenWithSidebar from "../components/ScreenWithSidebar.jsx";
import Link from "../widgets/Link.jsx";
import SpeciesSelect from "../components/SpeciesSelect.jsx";
import Select from "../widgets/Select.jsx";



export default ({species_sn}) => {

    const {
        selectedSpeciesSn,
        setSelectedSpeciesSn,
        setAnnotationSource,
        setProteinTypes,
        downloads
    } = useDownloads({species_sn})

    if(! downloads.isReady) {
        return <SpinnerSvg svgClasses={"w-8 h-8"}/>
    }

    const Sidebar = () =>
        <div>
            <SpeciesSelect species_sn={species_sn} onSelectSpecies={species => setSelectedSpeciesSn(species.sn)}/>
            <Select
                label="Annotations"
                onChange={e => setAnnotationSource(e.target.value)}
                value={downloads.filters.annotationSources}
            >
                {downloads.availableAnnotationSourcesOptions.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}
            </Select>
            <Select
                label="Protein Types"
                onChange={e => setProteinTypes(e.target.value)}
                value={downloads.filters.proteinTypes}
            >
                {downloads.availableProteinTypesOptions.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}
            </Select>
        </div>

    return (
        <ScreenWithSidebar
            sidebarPanel={<Sidebar/>}
        >
            <div className="grid grid-cols-6">
                <div className="col-start-1 col-span-5">
                    <DownloadsTable tableData={downloads.selectedSpeciesInfo.tableData}/>
                </div>
            </div>
        </ScreenWithSidebar>
    )
}


const columnHelper = createColumnHelper()
const DownloadsTable = ({tableData}) => {

    const [visibleFileInModal, setVisibleFileInModal] = useState(null)

    const columns= useMemo(() =>[
      columnHelper.accessor(
          row => row,
          {
            header: 'Annotation',
            cell: info => {
                const o = info.getValue()
                if(o === null) {
                    return null
                }
                if(o.file.annotationSources === "a") {
                    return "All"
                }

                return o.file.annotationListDisplay
            }
          }
      ),
      columnHelper.accessor(
          row => row,
          {
            header: "Supporting Evidence",
            cell: info => {
                const minPep = info.getValue().file.minPep
                if(minPep === 0) {
                    return `All predicted`
                }
                else if(minPep === 1) {
                    return `Detected with at least one unique peptides`
                }
                else if(minPep === 2) {
                    return `Detected with at least two unique peptides`
                }
            }
          }
      ),
      columnHelper.accessor(
          row => row,
          {
            header: "RefProts Included",
            cell: info => {
                if(info.getValue().file.proteinTypes.startsWith("refprots")) {
                    return "Yes"
                }
                return "No"
            }
          }
      ),
      columnHelper.accessor(
          row => row,
          {
            header: "File",
            cell: info => {
                const file = info.getValue().file
                return <Link href={file.zipUrl} text={`${file.fileName}.zip`}></Link>
            }
          }
      ),
      columnHelper.accessor(
          row => row,
          {
            header: "File Type",
            cell: info => {
                const t = info.getValue().file.fileType
                switch (t) {
                    case "tsv": return <span>TSV (Protein)</span>
                    case "fasta": return <span>Fasta (Protein)</span>
                    case "bed": return <span>BED</span>
                    default: throw `unknown file type ${t}`
                }
            }
          }
      ),
      columnHelper.accessor(
          row => row,
          {
            header: "Readme",
            cell: info => {
                const file = info.getValue().file
                //return <Link target={"_blank"} href={file.readmeUrl} text={"readme"}/>
                return <a
                    className={`font-medium text-blue-600 dark:text-blue-500 hover:underline`}
                    onClick={() => setVisibleFileInModal(file)}>
                    readme
                </a>
            }
          }
      )
    ],[])

    const downloadFilesTable = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel()
    })


    return  <>
        {visibleFileInModal &&
            <ReadmeModal
                downloadFileObject={visibleFileInModal}
                onClose={() => setVisibleFileInModal(null)}
            />
        }
        <table
        className="border-collapse border border-slate-400"
    >
        <thead>
          {downloadFilesTable.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th
                      key={header.id}
                      className="border border-slate-300"
                      colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {downloadFilesTable.getRowModel().rows.map(row => {
            return (
              <tr key={row.id} className={"hover:bg-gray-100"}>
                    {
                        row.getVisibleCells().map((cell, idx) => {
                            const ctx = cell.getContext()
                            const v = ctx.getValue()
                            if(idx == 0 && !v.hasFirstCol) {
                                return null
                            }
                            return (
                                <td
                                    rowSpan={idx == 0 && v.hasFirstCol ? v.firstColRowSpan : null}
                                    className="border border-slate-300"
                                    key={cell.id}
                                >
                                    {flexRender(cell.column.columnDef.cell, ctx)}
                                </td>
                            )
                        })
                    }
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
}

const ReadmeModal = ({title, downloadFileObject, onClose}) => {

    const [htmlBody, setHtmlBody] = useState("")

    useEffect(() => {

        if (downloadFileObject) {
            downloadFileObject.fetchReadme().then(setHtmlBody)
        }

    }, [downloadFileObject && downloadFileObject.readmeUrl])

    if (!downloadFileObject) {
        return <></>
    }

    return <div className="fixed top-0 left-0 right-0 z-50 w-full p-4 md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div className="relative w-full max-w-7xl">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-w-screen">
                <div className="flex items-center justify-between p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                        {downloadFileObject.fileName}
                    </h3>
                    <button onClick={onClose}
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="extralarge-modal">
                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clip-rule="evenodd"></path>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto" style={{maxHeight:700}}>
                  <div className={"prose md:prose-md"} dangerouslySetInnerHTML={ {__html:  htmlBody}}></div>
                </div>
                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                    <a
                        href={downloadFileObject.zipUrl}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        <svg className="w-4 h-4 text-gray-800 dark:text-white"
                             aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg"
                             fill="none"
                             viewBox="0 0 16 18"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3"
                            />
                        </svg>
                        Download
                    </a>
                    <button
                        onClick={onClose}
                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
}
