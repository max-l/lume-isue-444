import { listify } from 'radash'

export const SimpleDictTable = ({colDefs, rows}) =>
    <table className="border-collapse border border-slate-400">
        <thead>
            <tr>
            {
                listify(
                    colDefs,
                    (k, label) =>
                        <th
                            key={k}
                            className="border border-slate-300"
                        >
                            {label}
                        </th>
                )
            }
            </tr>
        </thead>
        <tbody>
        {
            rows.map(
                (o,idx) => <tr key={`r-${idx}`}>
                    {
                        listify(
                            colDefs,
                            (k, _) =>
                                <td
                                    key={`r${idx}-${k}`}
                                    className="border border-slate-300"
                                >
                                    {o[k]}
                                </td>
                        )
                    }
                </tr>
            )
        }
        </tbody>
    </table>
