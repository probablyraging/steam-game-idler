import React from 'react';
import { TiHeartFullOutline, TiMinus, TiPlus } from 'react-icons/ti';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoPlay } from 'react-icons/io5';
import { FaAward } from 'react-icons/fa';

export default function CardMenu({ item, favorites, cardFarming, achievementUnlocker, handleIdle, viewAchievments, addToFavorites, removeFromFavorites, addToCardFarming, removeFromCardFarming, addToAchievementUnlocker, removeFromAchievementUnlocker }) {
    return (
        <React.Fragment>
            <Dropdown classNames={{ content: ['rounded p-0'] }}>
                <DropdownTrigger>
                    <div className='p-1 border border-border hover:bg-containerhover hover:border-borderhover cursor-pointer rounded'>
                        <BsThreeDotsVertical />
                    </div>
                </DropdownTrigger>
                <DropdownMenu aria-label='actions'>
                    <DropdownItem
                        className='rounded'
                        key='idle'
                        startContent={<IoPlay />}
                        onClick={() => handleIdle(item.game.id, item.game.name)}
                    >
                        Idle game
                    </DropdownItem>
                    <DropdownItem
                        className='rounded'
                        key='achievements'
                        startContent={<FaAward />}
                        onClick={() => viewAchievments(item)}
                    >
                        View achievements
                    </DropdownItem>
                    {favorites.some(arr => arr.game.id === item.game.id) ? (
                        <DropdownItem
                            className='rounded'
                            key='fav-rem'
                            startContent={<TiHeartFullOutline />}
                            onClick={(e) => removeFromFavorites(e, item)}
                        >
                            Remove from favorites
                        </DropdownItem>
                    ) : (
                        <DropdownItem
                            className='rounded'
                            key='fav-add'
                            startContent={<TiHeartFullOutline />}
                            onClick={(e) => addToFavorites(e, item)}
                        >
                            Add to favorites
                        </DropdownItem>
                    )}
                    {cardFarming.some(arr => arr.game.id === item.game.id) ? (
                        <DropdownItem
                            className='rounded'
                            key='cf-rem'
                            startContent={<TiMinus />}
                            onClick={(e) => removeFromCardFarming(e, item)}
                        >
                            Remove from card farming
                        </DropdownItem>
                    ) : (
                        <DropdownItem
                            className='rounded'
                            key='cf-add'
                            startContent={<TiPlus />}
                            onClick={(e) => addToCardFarming(e, item)}
                        >
                            Add to card farming
                        </DropdownItem>
                    )}
                    {achievementUnlocker.some(arr => arr.game.id === item.game.id) ? (
                        <DropdownItem
                            className='rounded'
                            key='au-rem'
                            startContent={<TiMinus />}
                            onClick={(e) => removeFromAchievementUnlocker(e, item)}
                        >
                            Remove from achievement unlocker
                        </DropdownItem>
                    ) : (
                        <DropdownItem
                            className='rounded'
                            key='au-add'
                            startContent={<TiPlus />}
                            onClick={(e) => addToAchievementUnlocker(e, item)}
                        >
                            Add to achievement unlocker
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
}