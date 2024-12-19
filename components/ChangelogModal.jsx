import React, { useEffect, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from '@nextui-org/react';
import { getVersion } from '@tauri-apps/api/app';
import ReactMarkdown from 'react-markdown';
import styles from './ChangelogModal.module.css';
import rehypeRaw from 'rehype-raw';
import Loader from './Loader';
import ExtLink from './ExtLink';

export default function ChangelogModal({ showChangelogModal, setShowChangelogModal }) {
    const [changelog, setChangelog] = useState('');
    const [version, setVersion] = useState('');

    useEffect(() => {
        const fetchChangelog = async () => {
            const currentVersion = await getVersion();
            setVersion(currentVersion);
            const res = await fetch('https://raw.githubusercontent.com/zevnda/steam-game-idler/refs/heads/main/changelog.md');
            const data = await res.text();
            setChangelog(data.split('## Changelog')[1]);
        };
        fetchChangelog();
    }, []);

    const handleCloseModal = () => {
        setShowChangelogModal(false);
    };

    const transformIssueReferences = (text) => {
        const issueRegex = /(#\d{2,3})\b/g;
        let result = text;

        let match;
        while ((match = issueRegex.exec(text)) !== null) {
            const issueNumber = match[1];
            const issueLink = `https://github.com/zevnda/steam-game-idler/issues/${issueNumber.substring(1)}`;
            const link = `<a href='${issueLink}' target='_blank'><strong>${match[0]}</strong></a>`;
            result = result.replace(match[0], link);
        }

        return result;
    };

    const transformMentions = (text) => {
        const userRegex = /@([a-zA-Z0-9_-]+)/g;
        let result = text;

        let match;
        while ((match = userRegex.exec(text)) !== null) {
            const username = match[1];
            const userLink = `https://github.com/${username}`;
            const link = `<a href='${userLink}' target='_blank' rel='noopener noreferrer'><strong>${match[0]}</strong></a>`;
            result = result.replace(match[0], link);
        }

        return result;
    };

    const transformLinks = (text) => {
        const linkRegex = /\[(.*?)\]\((https?:\/\/.*?)\)/g;
        let result = text;

        let match;
        while ((match = linkRegex.exec(text)) !== null) {
            const linkText = match[1];
            const linkUrl = match[2];
            const newLink = `<a href='${linkUrl}' target='_blank' rel='noopener noreferrer'>${linkText}</a>`;
            result = result.replace(match[0], newLink);
        }

        return result;
    };

    return (
        <React.Fragment>
            <Modal isOpen={showChangelogModal} hideCloseButton backdrop='opaque' className='min-w-[700px] border border-border'>
                <ModalContent>
                    <React.Fragment>
                        <ModalHeader className='flex flex-col gap-1 bg-modalheader border-b border-border' data-tauri-drag-region>
                            Changelog for v{version}
                        </ModalHeader>
                        <ModalBody className='bg-modalbody max-h-[380px] overflow-y-auto'>
                            {changelog ? (
                                <ReactMarkdown
                                    className={`${styles.list} text-sm`}
                                    rehypePlugins={[rehypeRaw]}
                                >
                                    {transformLinks(transformIssueReferences(transformMentions(changelog)))}
                                </ReactMarkdown>
                            ) : (
                                <div className='flex justify-center items-center min-h-[100px]'>
                                    <Spinner />
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter className='bg-modalfooter border-t border-border'>
                            <div className='flex justify-center items-center gap-4'>
                                <ExtLink href={`https://github.com/zevnda/steam-game-idler/releases/tag/${version}`}>
                                    <p className='text-xs cursor-pointer'>
                                        View on GitHub
                                    </p>
                                </ExtLink>
                                <Button
                                    size='sm'
                                    className='bg-sgi text-offwhite font-semibold rounded-sm'
                                    onClick={handleCloseModal}
                                >
                                    Continue
                                </Button>
                            </div>
                        </ModalFooter>
                    </React.Fragment>
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}