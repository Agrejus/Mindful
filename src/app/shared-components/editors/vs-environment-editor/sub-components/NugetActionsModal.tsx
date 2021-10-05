import { render } from '@fullcalendar/common';
import * as React from 'react';
import { services } from '../../../../services/services';
import { DropdownButton } from '../../../buttons/drop-down-button/DropdownButton';
import { Modal } from '../../../modal/Modal';
import { IProject } from '../VisualStudioEnvironmentEditor';

interface Props {
    onClick: () => void;
    title: string;
    project: IProject;
    onChange: (project: IProject) => void;
    onDropdownToggle: (value: boolean) => void;
    isDropdownToggled: boolean;
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
}

interface State {
    nugetContent: string;
}

export class NugetActionsModal extends React.PureComponent<Props, State> {

    state: State = {
        nugetContent: ""
    }

    componentDidMount() {
        if (this.props.project.nuget?.nuspecFileNameAndPath) {
            const data = window.api.interactivity().fs.readFileSync(this.props.project.nuget.nuspecFileNameAndPath, 'utf8');
            this.setState({ nugetContent: data })
        }
    }

    onOpenNuspecClick = async () => {

        if (!this.props.project || !this.props.project.nuget?.nuspecFileNameAndPath) {
            return;
        }

        services.fileService.openFile(this.props.project.nuget.nuspecFileNameAndPath);
    }

    onCreateNuspecClick = async () => {

        if (!this.props.project) {
            return;
        }

        const response = await services.visualStudioService.createNuspecFile(this.props.project.fullPathAndFileName);
        const fileNameAndPathMatches = response.match(/\'.*?\'/g);

        if (!fileNameAndPathMatches?.length) {
            this.props.onError(response);
            return;
        }

        const fileNameAndPath = fileNameAndPathMatches[0].replace(/\'/g, '');

        if (!this.props.project.nuget) {
            this.props.project.nuget = {
                nuspecFileNameAndPath: fileNameAndPath
            };
        } else {
            this.props.project.nuget.nuspecFileNameAndPath = fileNameAndPath;
        }

        this.props.onChange(this.props.project);
    }

    saveNugetClick = () => {
        if (this.props.project.nuget?.nuspecFileNameAndPath) {
            window.api.interactivity().fs.writeFileSync(this.props.project.nuget.nuspecFileNameAndPath, this.state.nugetContent);
        }
    }

    getVersion = () => {
        if (!this.props.project.nuget?.nuspecFileNameAndPath) {
            return null;
        }

        const versionMatch = this.state.nugetContent.match(/<version>.*?<\/version>/g);

        if (!versionMatch?.length) {
            return null;
        }

        return {
            match: versionMatch[0],
            version: versionMatch[0].replace("<version>", "").replace("</version>", "").split('.').map(w => parseInt(w)),
            replacement: (parts: number[]) => {
                return `<version>${parts.join('.')}</version>`;
            }
        };
    }


    increment = (increment: (versionParts: number[]) => number[]) => {
        const version = this.getVersion();

        if (!version) {
            return;
        }

        const newVersion = increment(version.version);
        const replacementValue = version.replacement(newVersion);

        const { nugetContent } = this.state;
        const content = nugetContent.replace(version.match, replacementValue);

        this.setState({
            nugetContent: content
        })
    }

    incrementMajor = (versionParts: number[]) => {
        return versionParts.map((w, i) => { return i == 0 ? ++w : w });
    }

    incrementMinor = (versionParts: number[]) => {
        return versionParts.map((w, i) => { return i == 1 ? ++w : w });
    }

    incrementPatch = (versionParts: number[]) => {
        return versionParts.map((w, i) => { return i == 2 ? ++w : w });
    }

    render() {
        return <Modal
            buttons={["Ok"]}
            onClick={this.props.onClick}
            title={this.props.title}
            className="nuget-modal"
        >
            <div className="row actions-row">
                <div className="col-sm-12">
                    {
                        this.props.project.nuget?.nuspecFileNameAndPath ?
                            <React.Fragment>
                                <button className="btn btn-outline-success" onClick={this.saveNugetClick}>Save Nuspec</button>
                                <button className="btn btn-outline-default" onClick={this.onOpenNuspecClick}>Open Nuspec</button>
                            </React.Fragment> :
                            <button className="btn btn-outline-default" onClick={this.onCreateNuspecClick}>Create Nuspec</button>
                    }
                    <DropdownButton onToggle={this.props.onDropdownToggle} className="btn btn-secondary" title="Increment Nuspec" isToggled={this.props.isDropdownToggled}>
                        <a className="dropdown-item clickable" onClick={() => this.increment(this.incrementMajor)}>Increment Major</a>
                        <a className="dropdown-item clickable" onClick={() => this.increment(this.incrementMinor)}>Increment Minor</a>
                        <a className="dropdown-item clickable" onClick={() => this.increment(this.incrementPatch)}>Increment Patch</a>
                    </DropdownButton>
                    <button className="btn btn-outline-primary">Pack</button>
                    <button className="btn btn-outline-primary">Publish</button>
                </div>
            </div>
            {this.props.project.nuget?.nuspecFileNameAndPath && <div className="row text-area-row">
                <div className="col-sm-12">
                    <textarea value={this.state.nugetContent} onChange={e => this.setState({ nugetContent: e.target.value })} className="form-control" />
                </div>
            </div>}
        </Modal>
    }
}