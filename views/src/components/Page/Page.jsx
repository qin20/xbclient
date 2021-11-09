import React from 'react';
import namespace from '../../utils/namespace';

import './Page.scss';

const cls = namespace('bee-page');

export default function Page(props) {
    return (
        <div className={cls()}>
            <div className={cls('header')}>{props.header}</div>
            <div className={cls('content')}>{props.children}</div>
        </div>
    );
}
