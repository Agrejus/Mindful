import * as React from 'react';
import './CSharpToTypescript.scss';

interface Props {
    onClose: () => void;
}

interface IProperty {
    csharpType: string;
    typescriptType: string;
    name: string;
    casedName: string;
    isNullable: boolean;
    isArray: boolean;
}

export const CSharpToTypescript: React.FunctionComponent<Props> = (props) => {

    const [cSharp, setCsharp] = React.useState("");
    const [typescript, setTypescript] = React.useState("");

    const onCsharpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        const properties = text.split('\n').map(w => w.trim()).filter(w => !!w && w.startsWith("public") === true).map(w => toTypeScript(w)).filter(w => w != null) as IProperty[];

        for (let property of properties) {
            if (property.casedName.endsWith("Id")) {
                const nameToFind = property.casedName.replace("Id", "");
                const found = properties.find(w => w.casedName === nameToFind);

                if (found && property.isNullable) {
                    found.isNullable = true;
                }
            }
        }

        const result = properties.map(w => {
            finalizeTypescriptType(w);

            return `${w.casedName}: ${w.typescriptType}`;
        }).join("\n")

        setCsharp(text);
        setTypescript(result);
    }

    const toTypeScript = (line: string): IProperty | null => {
        const data = removeOccurances(line, "public", "{", "}", "get;", "set;");
        const items = data.split(' ').filter(w => !!w);

        if (items.length != 2) {
            return null
        }

        const property = toProperty(items[0]);
        const cSharpPropertyName = items[1];

        property.name = cSharpPropertyName
        property.casedName = toCamelCase(cSharpPropertyName);

        return property;
    }

    const isArrayType = (type: string) => {
        const startsWithTypes = ["List", "IEnumerable", "ICollection"];

        return startsWithTypes.some(w => type.startsWith(w));
    }

    const finalizeTypescriptType = (property: IProperty) => {
        if (property.isArray) {
            property.typescriptType = `${property.typescriptType}[]`;
        }

        if (property.isNullable) {
            property.typescriptType = `${property.typescriptType} | null`;
        }
    }

    const toProperty = (type: string): IProperty => {

        const isNullable = type.includes('?');
        const isArray = isArrayType(type);

        if (isArray) {
            const match = type.match(/\<.*\>/);

            if (match) {
                type = match[0].replace("<", "").replace(">", "")
            }
        }

        const result: IProperty = {
            casedName: "",
            csharpType: type,
            isArray,
            isNullable,
            name: "",
            typescriptType: ""
        }

        switch (type.toLowerCase().replace('?', '')) {

            case "int":
            case "int32":
            case "int64":
            case "decimal":
            case "float":
            case "double":
                result.typescriptType = "number";
                break;

            case "string":
            case "datetime":
            case "datetimeoffset":
                result.typescriptType = "string";
                break;
            case "bool":
            case "boolean":
                result.typescriptType = "boolean";
                break;
            default:
                result.typescriptType = `I${type}`;
                break;
        }

        return result;
    }

    const toCamelCase = (value: string) => {
        const items = value.split('');
        items[0] = items[0].toLowerCase();

        return items.join('');
    }

    const removeOccurances = (value: string, ...items: string[]) => {
        let result = value;
        for (let item of items) {
            result = result.replace(item, '');
        }

        return result;
    }

    return <div className="c-sharp-to-typescript">
        <i className="bi bi-x-circle clickable" onClick={props.onClose}></i>
        <h3>C# -&gt; Typescript</h3>
        <div className="row pretty-container">
            <div className="col-sm-6">
                <div><label>C#</label></div>
                <textarea className="form-control" value={cSharp} onChange={onCsharpChange} />

            </div>
            <div className="col-sm-6">
                <div><label>Typescript</label></div>
                <textarea className="form-control" readOnly={true} value={typescript} />
            </div>
        </div>
        <div className="row">
            <div className="col-sm-12">
                <button className="btn btn-danger pull-right" onClick={props.onClose}>Close&nbsp;<i className="bi bi-x"></i></button>
            </div>
        </div>
    </div>
}