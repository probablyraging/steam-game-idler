import React from 'react';
import { TiHeartFullOutline, TiMinus, TiPlus } from 'react-icons/ti';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoPlay } from 'react-icons/io5';
import { FaAward } from 'react-icons/fa';

export default function CardMenu({ item, favorites, cardFarming, achievementUnlocker, handleIdle, viewAchievments, addToFavorites, removeFromFavorites, addToCardFarming, removeFromCardFarming, addToAchievementUnlocker, removeFromAchievementUnlocker }) {
    return (
        <React.Fragment>
            <Dropdown classNames={{ content: ['rounded p-0 bg-base border border-border'] }}>
                <DropdownTrigger>
                    <div className='p-1 bg-black text-offwhite bg-opacity-50 hover:bg-black hover:bg-opacity-70 cursor-pointer rounded duration-200'>
                        <BsThreeDotsVertical />
                    </div>
                </DropdownTrigger>
                <DropdownMenu aria-label='actions'>
                    <DropdownItem
                        className='rounded'
                        key='idle'
                        startContent={<IoPlay />}
                        onClick={() => handleIdle(item.game.id, item.game.name)}
                        textValue='Idle game'
                    >
                        <p className='text-xs'>Idle game</p>
                    </DropdownItem>
                    <DropdownItem
                        className='rounded'
                        key='achievements'
                        startContent={<FaAward />}
                        onClick={() => viewAchievments(item)}
                        textValue='View achievements'
                    >
                        <p className='text-xs'>View achievements</p>
                    </DropdownItem>
                    {favorites.some(arr => arr.game.id === item.game.id) ? (
                        <DropdownItem
                            className='rounded'
                            key='fav-rem'
                            startContent={<TiHeartFullOutline />}
                            onClick={(e) => removeFromFavorites(e, item)}
                            textValue='Remove from favorites'
                        >
                            <p className='text-xs'>Remove from favorites</p>
                        </DropdownItem>
                    ) : (
                        <DropdownItem
                            className='rounded'
                            key='fav-add'
                            startContent={<TiHeartFullOutline />}
                            onClick={(e) => addToFavorites(e, item)}
                            textValue='Add to favorites'
                        >
                            <p className='text-xs'>Add to favorites</p>
                        </DropdownItem>
                    )}
                    {cardFarming.some(arr => arr.game.id === item.game.id) ? (
                        <DropdownItem
                            className='rounded'
                            key='cf-rem'
                            startContent={<TiMinus />}
                            onClick={(e) => removeFromCardFarming(e, item)}
                            textValue='Remove from card farming'
                        >
                            <p className='text-xs'>Remove from card farming</p>
                        </DropdownItem>
                    ) : (
                        <DropdownItem
                            className='rounded'
                            key='cf-add'
                            startContent={<TiPlus />}
                            onClick={(e) => addToCardFarming(e, item)}
                            textValue='Add to card farming'
                        >
                            <p className='text-xs'>Add to card farming</p>
                        </DropdownItem>
                    )}
                    {achievementUnlocker.some(arr => arr.game.id === item.game.id) ? (
                        <DropdownItem
                            className='rounded'
                            key='au-rem'
                            startContent={<TiMinus />}
                            onClick={(e) => removeFromAchievementUnlocker(e, item)}
                            textValue='Remove from achievement unlocker'
                        >
                            <p className='text-xs'>Remove from achievement unlocker</p>
                        </DropdownItem>
                    ) : (
                        <DropdownItem
                            className='rounded'
                            key='au-add'
                            startContent={<TiPlus />}
                            onClick={(e) => addToAchievementUnlocker(e, item)}
                            textValue='Add to achievement unlocker'
                        >
                            <p className='text-xs'>Add to achievement unlocker</p>
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
}