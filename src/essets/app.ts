import { $App, $Boolean, $Collection, $Complex, $Component, $Date, $ivy, $Number, $Persistent } from "../lib/ivy";
import { $Section, $String} from "../lib/ivy";
import { View} from "../lib/views";
import { Group, Groups, Person, Persons } from "./entity";

export class EssetsApp extends $App {

    public constructor(owner: $Complex) {
        super(owner);
    }

    public dataSet = $ivy<DataSets>(DataSets);

}

export class DataSets extends $Persistent {

    public constructor(owner: $Complex) {
        super(owner);
    }

    public persons = $ivy<Persons>(Persons);
    public groups = $ivy<Groups>(Groups);
}
