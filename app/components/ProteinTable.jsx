import  {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "react-table";

import Link from "../widgets/Link.jsx";

const columnHelper = createColumnHelper()

const ProteinTable = ({species_sn, proteinQueryResult, queryInProgress}) => {

  const debug = false

  const AccessionsCell = ({accessions, renderAccession}) => {

      const displayedAccessions =
            accessions.length > 4 ? accessions.slice(0, 4) : accessions

      const hasNonDisplayedAccessions = displayedAccessions.length < accessions.length

      const showMore = hasNonDisplayedAccessions ? <span>...</span> : ""

      return <span>{displayedAccessions.map((a, idx) => renderAccession(a, `a-${idx}`))} {showMore}</span>
  }

  const columns = [
    columnHelper.accessor(
        row => row,
        {
          id: "protein",
          cell: info => {
              const row = info.getValue()
              return <AccessionsCell
                  accessions={row.searchable_accessions.p}
                  renderAccession={
                    (a, key) => <Link
                        href={`/proteins/${species_sn}/${row.protein_seq_id}`}
                        key={`tt-${a}`}  text={a}
                        extraClasses={"mx-1"}
                    />
                  }
              />
          },
          header: () => <span>Protein</span>
        }
    ),
    columnHelper.accessor(
        row => row.protein_length,
        {
          id: "length",
          header: () => <span>length</span>,
          cell: info => info.getValue()
        }
    ),
    columnHelper.accessor(
        row => row.searchable_accessions.g,
        {
          id: "gene",
          header: () => <span>Gene</span>,
          cell: info =>
              <AccessionsCell
                  accessions={info.getValue()}
                  renderAccession={(a, key) => <span key={key} className={"mx-1"}>{a}</span>}
              />
        }
    ),
    columnHelper.accessor(
        row => row.searchable_accessions.t,
        {
          id: "transcript",
          header: () => <span>Transcript</span>,
          cell: info =>
              <AccessionsCell
                  accessions={info.getValue()}
                  renderAccession={(a, key) => <span key={key} className={"mx-1"}>{a}</span>}
              />
        }
    ),
    columnHelper.accessor(
        row => row.ms_score,
        {
          id: "ms_score",
          header: () => <span>MS Score</span>,
          cell: info => info.getValue()
        }
    ),
    columnHelper.accessor(
        row => row.rs_score,
        {
          id: "rs_score",
          header: () => <span>RS Score</span>,
          cell: info => info.getValue()
        }
    ),
    columnHelper.accessor(
        row => row.domains_detected_count,
        {
          id: "domains_count",
          header: () => <span>Domains</span>,
          cell: info => info.getValue()
        }
    )
  ]

    if(debug) {
        columns.push(
            columnHelper.accessor(
                row => row,
                {
                    id: "debug",
                    header: () => <span>Debug</span>,
                    cell: info => {
                        const row = info.getValue()
                        return <span>{row.annotation_sources}
                        </span>
                    }
                }
            )
        )
    }

  const table = useReactTable({
    data: proteinQueryResult,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div className="p-2">
      <table className={"w-full text-sm text-left text-gray-500"}>
        <thead className={"text-xs text-gray-700 bg-gray-50"}>
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
            <tr key={row.id} className={"bg-white border-b hover:bg-gray-100"}>
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
  )
}

export default ProteinTable
