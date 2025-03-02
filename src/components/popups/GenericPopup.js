import React, {useContext, useEffect} from 'react';
import {Transition} from '@headlessui/react';
import {PopupFrame} from '../Frame';
import AppContext from '../../AppContext';

const GenericPopup = (props) => {
    // The modal will cover the whole screen, so while it is hidden, we need to disable pointer events
    const {dispatchAction} = useContext(AppContext);

    const close = (event) => {
        dispatchAction('closePopup');
        if (props.callback) {
            props.callback(false);
        }
    };

    useEffect(() => {
        const listener = (event) => {
            if (event.key === 'Escape') {
                close();
            }
        };
        window.addEventListener('keydown', listener, {passive: true});

        return () => {
            window.removeEventListener('keydown', listener, {passive: true});
        };
    });

    return (
        <Transition show={props.show} appear={true}>
            <PopupFrame>
                <div>
                    <Transition.Child
                        enter="transition duration-200 linear"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition duration-200 linear"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="to-rgba(0,0,0,0.1) fixed top-0 left-0 flex h-screen w-screen justify-center overflow-hidden bg-gradient-to-b from-[rgba(0,0,0,0.2)] pt-0 backdrop-blur-[2px] sm:pt-12" onMouseDown={close}>
                            <Transition.Child
                                enter="transition duration-200 delay-150 linear"
                                enterFrom="translate-y-4 opacity-0"
                                enterTo="translate-y-0 opacity-100"
                                leave="transition duration-200 linear"
                                leaveFrom="translate-y-0 opacity-100"
                                leaveTo="translate-y-4 opacity-0"
                            >
                                {props.children}
                            </Transition.Child>
                        </div>
                    </Transition.Child>
                </div>
            </PopupFrame>
        </Transition>
    );
};

export default GenericPopup;
