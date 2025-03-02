import React, {useContext, useState, useRef, useEffect} from 'react';
import {Transition} from '@headlessui/react';
import CloseButton from './CloseButton';
import AppContext from '../../AppContext';
import {isMobile} from '../../utils/helpers';

const AddDetailsPopup = (props) => {
    const inputNameRef = useRef(null);
    const inputBioRef = useRef(null);
    const {dispatchAction, member, accentColor} = useContext(AppContext);

    const [name, setName] = useState(member.name ?? '');
    const [bio, setBio] = useState(member.bio ?? '');

    const maxBioChars = 50;
    let initialBioChars = maxBioChars;
    if (member.bio) {
        initialBioChars -= member.bio.length;
    }
    const [bioCharsLeft, setBioCharsLeft] = useState(initialBioChars);

    const [error, setError] = useState({name: '', bio: ''});

    const stopPropagation = (event) => {
        event.stopPropagation();
    };

    const close = (succeeded) => {
        dispatchAction('closePopup');
        props.callback(succeeded);
    };

    const submit = async () => {
        if (name.trim() !== '') {
            await dispatchAction('updateMember', {
                name,
                bio
            });
            close(true);
        } else {
            setError({name: 'Enter your name'});
            setName('');
            inputNameRef.current?.focus();
        }
    };

    // using <input autofocus> breaks transitions in browsers. So we need to use a timer
    useEffect(() => {
        if (!isMobile()) {
            const timer = setTimeout(() => {
                if (props.bioAutofocus) {
                    inputBioRef.current?.focus();
                } else {
                    inputNameRef.current?.focus();
                }  
            }, 200);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [inputNameRef, inputBioRef, props.bioAutofocus]);

    const renderExampleProfiles = (index) => {
        const renderEl = (profile) => {
            return (
                <Transition
                    appear
                    enter={`transition duration-200 delay-[400ms] ease-out`}
                    enterFrom="opacity-0 translate-y-2"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition duration-200 ease-in"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-2"
                    key={profile.name}
                >
                    <div className="flex flex-row items-center justify-start gap-3 pr-4">
                        <div className="h-10 w-10 rounded-full border-2 border-white bg-cover bg-no-repeat" style={{backgroundImage: `url(${profile.avatar})`}} />
                        <div className="flex flex-col items-start justify-center">
                            <div className="text-base font-sans font-semibold tracking-tight text-white">
                                {profile.name}
                            </div>
                            <div className="font-sans text-[14px] tracking-tight text-neutral-400">
                                {profile.expertise}
                            </div>
                        </div>
                    </div>
                </Transition> 
            );
        };

        let returnable = [];

        // using URLS over real images for avatars as serving JPG images was not optimal (based on discussion with team)
        let exampleProfiles = [
            {avatar: 'https://randomuser.me/api/portraits/men/32.jpg', name: 'James Fletcher', expertise: 'Full-time parent'},
            {avatar: 'https://randomuser.me/api/portraits/women/30.jpg', name: 'Naomi Schiff', expertise: 'Founder @ Acme Inc'},
            {avatar: 'https://randomuser.me/api/portraits/men/4.jpg', name: 'Franz Tost', expertise: 'Neurosurgeon'},
            {avatar: 'https://randomuser.me/api/portraits/women/51.jpg', name: 'Katrina Klosp', expertise: 'Local resident'}
        ];

        for (let i = 0; i < exampleProfiles.length; i++) {
            returnable.push(renderEl(exampleProfiles[i]));
        }

        return returnable;
    };

    return (
        <div className="rounded-none relative h-screen w-screen overflow-hidden bg-white p-[28px] text-center shadow-modal sm:h-auto sm:w-[720px] sm:rounded-xl sm:p-0" onMouseDown={stopPropagation}>
            <div className="flex">
                {!isMobile() &&
                    <div className={`flex w-[40%] flex-col items-center justify-center bg-[#1C1C1C]`}>
                        <div className="-mt-[1px] flex flex-col gap-9">
                            {renderExampleProfiles()}
                        </div>
                    </div>
                }
                <div className={`${isMobile() ? 'w-full' : 'w-[60%]'} p-0 sm:p-8`}>
                    <h1 className="mb-1 text-center font-sans text-[24px] font-bold tracking-tight text-black sm:text-left">Complete your profile<span className="hidden sm:inline">.</span></h1>
                    <p className="text-base pr-0 text-center font-sans leading-9 text-neutral-500 sm:pr-10 sm:text-left">Add context to your comment, share your name and expertise to foster a healthy discussion.</p>
                    <section className="mt-8 text-left">
                        <div className="mb-2 flex flex-row justify-between">
                            <label htmlFor="comments-name" className="font-sans text-[1.3rem] font-semibold">Name</label>
                            <Transition
                                show={!!error.name}
                                enter="transition duration-300 ease-out"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="transition duration-100 ease-out"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="font-sans text-sm text-red-500">{error.name}</div>
                            </Transition>
                        </div>
                        <input
                            id="comments-name"
                            className={`flex h-[42px] w-full items-center rounded border border-neutral-200 px-3 font-sans text-[16px] outline-0 transition-[border-color] duration-200 focus:border-neutral-300 ${error.name && 'border-red-500 focus:border-red-500'}`}
                            type="text"
                            name="name"
                            ref={inputNameRef}
                            value={name}
                            placeholder="Jamie Larson"
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setName(e.target.value);
                                    submit();
                                }
                            }}
                            maxLength="64"
                        />
                        <div className="mt-6 mb-2 flex flex-row justify-between">
                            <label htmlFor="comments-name" className="font-sans text-[1.3rem] font-semibold">Expertise</label>
                            <div className={`font-sans text-[1.3rem] text-neutral-400 ${(bioCharsLeft === 0) && 'text-red-500'}`}><b>{bioCharsLeft}</b> characters left</div>
                        </div>
                        <input
                            id="comments-bio"
                            className={`flex h-[42px] w-full items-center rounded border border-neutral-200 px-3 font-sans text-[16px] outline-0 transition-[border-color] duration-200 focus:border-neutral-300 ${(bioCharsLeft === 0) && 'border-red-500 focus:border-red-500'}`}
                            type="text"
                            name="bio"
                            ref={inputBioRef}
                            value={bio}
                            placeholder="Head of Marketing at Acme, Inc"
                            onChange={(e) => {
                                let bioText = e.target.value;
                                setBioCharsLeft(maxBioChars - bioText.length);
                                setBio(bioText);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setBio(e.target.value);
                                    submit();
                                }
                            }}
                            maxLength={maxBioChars}
                        />
                        <button
                            className={`mt-10 flex h-[42px] w-full items-center justify-center rounded-md px-8 font-sans text-[15px] font-semibold text-white opacity-100 transition-opacity duration-200 ease-linear hover:opacity-90`}
                            style={{backgroundColor: accentColor ?? '#000000'}}
                            onClick={submit}
                        >
                            Save
                        </button>
                    </section>
                </div>
                <CloseButton close={() => close(false)} />
            </div>
        </div>
    );
};

export default AddDetailsPopup;
