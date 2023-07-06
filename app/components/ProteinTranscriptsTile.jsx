import { useMemo, useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from 'react-table'
import Link from "../widgets/Link.jsx";
import {useFetchProteinTranscripts} from "../hooks.js";
import TranscriptExpression from "../components/TranscriptExpression.jsx";

const columnHelper = createColumnHelper()


const TranscriptsTable = ({species_sn, protein_seq_id, onSelectedTranscript}) => {

    const {isReady, rows} = useFetchProteinTranscripts({
        species_sn,
        protein_seq_id
    })

    useEffect(() => {
        if(isReady) {
            for(let row of rows) {
                if(row.gtex_available) {
                    onSelectedTranscript(row)
                    return
                }
            }
        }
    },[`${isReady}`])

    const columns= useMemo(
        () => [
            columnHelper.accessor(
              row => row.annotation_source === "e" ? "Ensembl": "Refseq",
              {
                header: "annotation",
                cell: info => info.getValue()
              }
            ),
            columnHelper.accessor(
              row => row.accession,
              {
                header: "accession",
                cell: info => info.getValue()
              }
            ),
            columnHelper.accessor(
              row => row,
              {
                header: "tissue expression",
                cell: info => {
                    const row = info.getValue()
                    if(! row.gtex_available) {
                        return null
                    }
                    return <a className={"cursor-pointer text-blue-800"} onClick={() => onSelectedTranscript(row)}>
                        GTEx data
                    </a>
                }
              }
            ),
            columnHelper.accessor(
              row => row.type,
              {
                header: "type",
                cell: info => info.getValue()
              }
            ),
            columnHelper.accessor(
              row => row.frame,
              {
                header: "frame",
                cell: info => info.getValue()
              }
            ),
            columnHelper.accessor(
              row => row.strand,
              {
                header: "strand",
                cell: info => info.getValue()
              }
            ),
            columnHelper.accessor(
              row => row.as_kosak_motif === 1 ? "+": "-",
              {
                header: "kozak",
                cell: info => info.getValue()
              }
            ),
            columnHelper.accessor(
              row => row.high_eff_tis_motif === 1 ? "+": "-",
              {
                header: "high eff. TIS",
                cell: info => info.getValue()
              }
            )
        ],
        []
    )

    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel()
    })

    if(!isReady) {
        return <div>loading...</div>
    }

    return <table className="w-full text-sm text-left text-gray-500">
        <thead className={"text-xs text-gray-700 uppercase bg-gray-50"}>
          {table.getHeaderGroups().map(headerGroup => (
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
          {table.getRowModel().rows.map(row => {
            return (
              <tr key={row.id}>
                    {
                        row.getVisibleCells().map(cell => {
                            const ctx = cell.getContext()
                            const v = ctx.getValue()
                            return <td
                                className="border border-slate-300"
                                key={cell.id}
                            >
                                {flexRender(cell.column.columnDef.cell, ctx)}
                            </td>
                        })
                    }
              </tr>
            )
          })}
        </tbody>
      </table>
}


export default ({species_sn, protein_seq_id}) => {

    const [selectedTranscript, setSelectedTranscript] = useState(null)

    return <div className="shadow-[0px_0px_6px_0px_rgba(0,0,0,0.2)] mt-3 mr-3 rounded p-3">
          <div className="border-b width-full border-slate-200 mb-4">
            <p className="font-semibold">Transcripts</p>
          </div>
<div className="w-4/5">
            <TranscriptsTable species_sn={species_sn} protein_seq_id={protein_seq_id} onSelectedTranscript={setSelectedTranscript}/>
            {selectedTranscript && <TranscriptExpression transcript={selectedTranscript} />}            
</div>
    </div>
}
