import React from 'react';
import classnames from 'classnames';
import namespace from '../../utils/namespace';

import './Inner.scss';

const cls = namespace('bee-inner');

export default function Inner(props) {
    return (
        <div className={classnames(cls(), props.className)}>
            {props.children}
        </div>
    )
}
