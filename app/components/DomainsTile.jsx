import { useMemo } from "react";
import {useDomains} from "../hooks.js";
import  {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
  } from "react-table";
  
import Link from "../widgets/Link.jsx";

const columnHelper = createColumnHelper()

const DomainsTile = ({protein_seq_id}) => {

    const {isReady, matches} = useDomains(protein_seq_id)

    const columns = useMemo(() => [
        columnHelper.accessor(
            row => row,
            {
              id: "accession",
              header: () => <span>accession</span>,
              cell: info => {
                  const d = info.getValue()
                  return <Link target={"_blank"}  href={`/proteins/`}  key={`tt-${d.signature.accession}`}  text={d.signature.accession}  extraClasses={"mx-1"} />
              }
            }
        ),
        columnHelper.accessor(
            row => row,
            {
              id: "description",
              header: () => <span>description</span>,
              cell: info => info.getValue().signature.description
            }
        ),
        columnHelper.accessor(
            row => row,
            {
              id: "score",
              header: () => <span>score</span>,
              cell: info => info.getValue().score
            }
        )
      ], [])

    const table = useReactTable({
        data: matches,
        columns,
        getCoreRowModel: getCoreRowModel()
    })

    if(!isReady) {
        return <span>...loading</span>
    }

    if(!matches) {
      return <div>No Predicted Domains</div>
    }

    return (
      <div className="shadow-[0px_0px_6px_0px_rgba(0,0,0,0.2)] mt-3 mr-3 rounded p-3">
          <div className="border-b width-full border-slate-200">
            <p className="font-semibold">Predicted Domains</p>
          </div>
        <table className={"w-full text-sm text-left text-gray-500"}>
          <thead className={"text-xs text-gray-700 uppercase bg-gray-50"}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className={"px-4 py-1"}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className={"bg-white border-b hover:bg-gray-50"}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className={"px-4 py-1"}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
);
}

export default DomainsTile