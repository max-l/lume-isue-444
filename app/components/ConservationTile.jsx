import { useMemo } from "react"
import {
    useReactTable,
    getCoreRowModel,
    createColumnHelper,
    flexRender
} from 'react-table'

import {useConservation} from "../hooks.js"
import {SimpleDictTable} from "../widgets/SimpleTable.jsx"


const columnHelper = createColumnHelper()

export default ({species_sn, protein_seq_id}) => {

    const {
        orthologs,
        paralogs
    } = useConservation({
        species_sn,
        protein_seq_id,
        renderSpeciesCell: species => species.sc
    })


    const blastColumnTitles = {
        sseq_a: "subject",
        pident: "pident",
        length: "length",
        mismatch: "mismatch",
        gapopen: "gapopen",
        qstart: "qstart",
        qend: "qend",
        sstart: "sstart",
        send: "send",
        evalue: "evalue",
        bitscore: "bitscore",
        qcovs: "qcovs",
        qlen: "qlen",
        slen: "slen"
    }


    const paralogColumTitles = {
        ...blastColumnTitles,
        is_isoform: "isoform"
    }


    const columns= useMemo(() =>[
          columnHelper.accessor(
              row => row[0],
              {
                header: 'Species',
                cell: info => {
                    const o = info.getValue()
                    if(o === null) {
                        return null
                    }

                    return o.content
                }
              }
          ),
            ...["subject",
                "pident",
                "length",
                "mismatch",
                "gapopen",
                "qstart",
                "qend",
                "sstart",
                "send",
                "evalue",
                "bitscore",
                "qcovs",
                "qlen",
                "slen"
            ].map(
              (title, idx) =>
                columnHelper.accessor(
                  row => row[idx + 1],
                  {
                    header: title,
                    cell: info => info.getValue().content
                  }
                )
          )
        ],[])

    const orthologTable = useReactTable({
        data: orthologs,
        columns,
        getCoreRowModel: getCoreRowModel()
    })


    const renderOrthologTable = () =>  <table className="w-4/5 text-sm text-left text-gray-500">
        <thead>
          {orthologTable.getHeaderGroups().map(headerGroup => (
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
          {orthologTable.getRowModel().rows.map(row => {
            return (
              <tr
                  key={row.id}
              >
                    {
                        row.getVisibleCells().map(cell => {
                            const ctx = cell.getContext()
                            const v = ctx.getValue()
                            if(v === null) {
                                return null
                            }
                            if(!v) {
                                return null
                            }
                            return (
                                <td
                                    rowSpan={v.rowSpan}
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

    return <div className="shadow-[0px_0px_6px_0px_rgba(0,0,0,0.2)] mt-3 mr-3 rounded p-3">
        <div className="border-b width-full border-slate-200">
          <p className="font-semibold">Conservation Analysis</p>
        </div>
        <h2 className="font-semibold mt-3">Orthologs</h2>
        {renderOrthologTable()}
        <h2 className="font-semibold mt-3">Paralogs</h2>
        <SimpleDictTable colDefs={paralogColumTitles} rows={paralogs}/>
    </div>
}

