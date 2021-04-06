/* eslint-disable no-unused-vars */
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

export class PackageScriptNotFoundFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_SCRIPT_NOT_FOUND];

    public fix(): boolean {
        const script = this.issue.skeleton.composer.script(this.issue.name);

        this.issue.repository.composer.addScript(script)
            .save();

        console.log(`* PACKAGE SCRIPT FIXER: add composer script '${this.issue.name}'`);

        this.issue.resolved = true;

        return true;
    }

    public static prettyName(): string {
        return 'copy-script';
    }
}
