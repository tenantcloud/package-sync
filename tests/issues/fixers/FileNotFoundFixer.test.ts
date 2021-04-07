/* eslint-disable no-undef */

import { existsSync, unlinkSync } from 'fs';
import { FileNotFoundFixer } from '../../../src/issues/fixers/FileNotFoundFixer';
import { RepositoryIssue } from '../../../src/issues/RepositoryIssue';
import { Repository, RepositoryKind } from '../../../src/lib/Repository';
import { ComparisonKind } from '../../../src/types/FileComparisonResult';

let skeleton: Repository, repo: Repository, issue: RepositoryIssue, fixer: FileNotFoundFixer;

beforeEach(() => {
    skeleton = Repository.create(__dirname + '/../../data/test-skeleton', RepositoryKind.SKELETON);
    repo = Repository.create(__dirname + '/../../data/test-package', RepositoryKind.PACKAGE);

    issue = new RepositoryIssue(
        { kind: ComparisonKind.FILE_NOT_FOUND, score: 0 },
        'testfile1.txt',
        skeleton.getFile('testfile1.txt'),
        null,
        skeleton,
        repo,
    );

    fixer = new FileNotFoundFixer(issue);

    issue.availableFixers.push(fixer.getClass().prettyName());
});

it('copies a missing file from skeleton to package', () => {
    const targetFile = `${issue.repository.path}/${issue.name}`;

    expect(existsSync(targetFile)).toBeFalsy();
    expect(fixer.fix()).toBeTruthy();
    expect(existsSync(targetFile)).toBeTruthy();

    unlinkSync(targetFile);
});

it("doesn't copy a missing file if the issue is resolved", () => {
    const targetPath = `${issue.repository.path}/${issue.name}`;

    issue.resolve('test');

    expect(existsSync(targetPath)).toBeFalsy();
    expect(fixer.fix()).toBeFalsy();
    expect(existsSync(targetPath)).toBeFalsy();
});