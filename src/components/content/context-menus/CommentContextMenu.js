import React, {useContext, useEffect, useRef} from 'react';
import AppContext from '../../../AppContext';
import AdminContextMenu from './AdminContextMenu';
import AuthorContextMenu from './AuthorContextMenu';
import NotAuthorContextMenu from './NotAuthorContextMenu';

const CommentContextMenu = (props) => {
    const {member, admin} = useContext(AppContext);
    const comment = props.comment;
    const isAuthor = member && comment.member?.uuid === member?.uuid;
    const isAdmin = !!admin;
    const element = useRef();

    useEffect(() => {
        const listener = () => {
            props.close();
        };

        // We need to listen for the window outside the iframe, and also the iframe window events
        window.addEventListener('click', listener, {passive: true});
        const el = element.current?.ownerDocument?.defaultView;

        if (el && el !== window) {
            el.addEventListener('click', listener, {passive: true});
        }

        return () => {
            window.removeEventListener('click', listener, {passive: true});
            if (el && el !== window) {
                el.removeEventListener('click', listener, {passive: true});
            }
        };
    }, [props]);

    useEffect(() => {
        const listener = (event) => {
            if (event.key === 'Escape') {
                props.close();
            }
        };
        // For keydown, we only need to listen to the main window, because we pass the events
        // manually in the Iframe component
        window.addEventListener('keydown', listener, {passive: true});

        return () => {
            window.removeEventListener('keydown', listener, {passive: true});
        };
    });

    // Prevent closing the context menu when clicking inside of it
    const stopPropagation = (event) => {
        event.stopPropagation();
    };

    let contextMenu = null;
    if (comment.status === 'published') {
        if (isAuthor) {
            contextMenu = <AuthorContextMenu comment={comment} close={props.close} toggleEdit={props.toggleEdit} />;
        } else {
            if (isAdmin) {
                contextMenu = <AdminContextMenu comment={comment} close={props.close}/>;
            } else {
                contextMenu = <NotAuthorContextMenu comment={comment} close={props.close}/>;
            }
        }
    } else {
        if (isAdmin) {
            contextMenu = <AdminContextMenu comment={comment} close={props.close}/>;
        } else {
            return null;
        }
    }

    return (
        <div ref={element} onClick={stopPropagation}>
            <div className="absolute z-10 min-w-min whitespace-nowrap rounded bg-white py-3 pl-4 pr-8 font-sans text-sm shadow-lg outline-0 dark:bg-zinc-900 dark:text-white sm:min-w-[150px]">
                {contextMenu}
            </div>
        </div>
    );
};

export default CommentContextMenu;
