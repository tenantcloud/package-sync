/* eslint-disable no-unused-vars */
import { last } from '../../lib/helpers';
import { ComparisonKind } from '../../types/FileComparisonResult';
import { Fixer } from './Fixer';

const semver = require('semver');

export class PackageVersionFixer extends Fixer {
    public static handles = [ComparisonKind.PACKAGE_VERSION_MISMATCH];

    public mergeVersions(repoVersion: string, newVersion: string) {
        const repoVersionParts = repoVersion.split('|');
        const newVersionParts = newVersion.split('|');

        const latestRepoVersion = last(repoVersionParts);
        const latestNewVersion = last(newVersionParts);

        if (semver.gt(semver.coerce(latestNewVersion), semver.coerce(latestRepoVersion))) {
            const diff = semver.diff(semver.coerce(latestRepoVersion), semver.coerce(latestNewVersion));

            if (diff === 'major') {
                repoVersionParts.push(latestNewVersion);
            } else {
                repoVersionParts[repoVersionParts.length - 1] = latestNewVersion;
            }
        }

        return repoVersionParts.join('|');
    }

    public fix(): boolean {
        if (this.issue.resolved) {
            return false;
        }

        const newPkg = this.issue.skeleton.composer.package(this.issue.name);
        const repoPkg = this.issue.repository.composer.package(this.issue.name);

        this.issue.repository.composer.setPackageVersion(repoPkg, this.mergeVersions(repoPkg.version, newPkg.version))
            .save();

        console.log(`* PACKAGE VERSION FIXER: copy version from skeleton for package '${this.issue.name}'`);

        this.issue.resolve(PackageVersionFixer.prettyName()).resolvedNotes.push(`updated version to '${repoPkg.version}'`);

        return true;
    }

    public static prettyName(): string {
        return 'merge-version';
    }
}