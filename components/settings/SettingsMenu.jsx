import React from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import ExtLink from '../ExtLink';

export default function SettingsMenu() {
    return (
        <React.Fragment>
            <Dropdown classNames={{ content: ['rounded p-0 bg-base border border-border'] }}>
                <DropdownTrigger>
                    <Button
                        isIconOnly
                        size='sm'
                        className='bg-base border border-border rounded-sm'
                    >
                        <BiDotsVerticalRounded size={24} />
                    </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label='Settings actions'>
                    <DropdownItem key='help' className='rounded p-0 m-0' textValue='Help'>
                        <ExtLink href={'https://github.com/probablyraging/steam-game-idler/wiki'} className={'flex text-xs w-full px-2 py-1'}>
                            Help
                        </ExtLink>
                    </DropdownItem>
                    <DropdownItem key='changelog' className='rounded p-0 m-0' textValue='Changelog'>
                        <ExtLink href={'https://github.com/probablyraging/steam-game-idler/releases'} className={'flex text-xs w-full px-2 py-1'}>
                            Changelog
                        </ExtLink>
                    </DropdownItem>
                    <DropdownItem key='report' className='rounded p-0 m-0' textValue='Report an issue'>
                        <ExtLink href={'https://github.com/probablyraging/steam-game-idler/issues/new?assignees=ProbablyRaging&labels=bug%2Cinvestigating&projects=&template=issue_report.yml&title=Title'} className={'flex text-xs w-full px-2 py-1'}>
                            Report an issue
                        </ExtLink>
                    </DropdownItem>
                    <DropdownItem key='feature' className='rounded p-0 m-0' textValue='Feature request'>
                        <ExtLink href={'https://github.com/probablyraging/steam-game-idler/issues/new?assignees=ProbablyRaging&labels=feature+request&projects=&template=feature_request.yml&title=Title'} className={'flex text-xs w-full px-2 py-1'}>
                            Feature request
                        </ExtLink>
                    </DropdownItem>
                    <DropdownItem key='support-me' className='rounded p-0 m-0' textValue='Support me'>
                        <ExtLink href={'https://github.com/sponsors/probablyraging'} className={'flex text-xs w-full px-2 py-1'}>
                            Support me
                        </ExtLink>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
}