
import {useSpeciesSelect} from "../hooks.js";
import Select from "../widgets/Select.jsx";

export default ({species_sn, onSelectSpecies}) => {

    const {
        all_species,
        setSelectedSpecies,
        selectedSpecies
    } = useSpeciesSelect({species_sn, onSelectSpecies})

    return (
        <Select
            label="Species"
            onChange={e => setSelectedSpecies(e.target.value)}
            value={selectedSpecies.sn}
        >
            {all_species.map((species, idx) =>
                <option
                    key={species.sn}
                    value={species.sn}
                >
                    {species.sc}
                </option>
            )}
        </Select>
   )
}
