import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper
} from 'react-table'
import Link from "../widgets/Link.jsx";
import {useFetchRiboseqData} from "../hooks.js";

const columnHelper = createColumnHelper()

//good test:  ENSP00000367263.4, http://localhost:3000/proteins/HS/196752

const RiboseqTable = ({species_sn, protein_seq_id}) => {

    const {isReady, rows} = useFetchRiboseqData({
        species_sn,
        protein_seq_id,
        renderStudy: study =>
            <div>
               <Link
                   href={study.url}
                   target={"_blank"}
                   text={study.study_name}
               />
               {study.citation && <div>PMID: {study.citation}</div>}
           </div>,
        renderSamples: samples => samples.map(
            sample =>
                <div
                    key={`${sample.accession}`}
                >
                    {sample.accession}: {sample.value}
                </div>
        )
    })

    const columns= useMemo(
        () => [
          columnHelper.accessor(
              row => row[0],
              {
                header: 'study',
                cell: info => {
                    const o = info.getValue()
                    if(o === null) {
                        return null
                    }

                    return o.content
                }
              }
          ),
          ...["annotation source",
              "codon",
              "type",
              "start score",
              "range score",
              "p value",
              "samples",
              "total readcount",
              "transcript,protein",
              "overlap %"
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
        ],
        []
    )

    const table = useReactTable({
        data: rows,
        columns,
        //onGroupingChange: () => {},
        //getExpandedRowModel: getExpandedRowModel(),
        //getGroupedRowModel: getGroupedRowModel(),
        getCoreRowModel: getCoreRowModel()
    })

    if(!isReady) {
        return <div>loading...</div>
    }

    return <table className="w-4/5 text-sm text-left text-gray-500">
        <thead>
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
}


export default ({species_sn, protein_seq_id}) => {


    return <div className="shadow-[0px_0px_6px_0px_rgba(0,0,0,0.2)] mt-3 mr-3 rounded p-3">
          <div className="border-b width-full border-slate-200 mb-4">
            <p className="font-semibold">Ribosome Profiling</p>
          </div>
        <RiboseqTable species_sn={species_sn} protein_seq_id={protein_seq_id}/>
    </div>
}
