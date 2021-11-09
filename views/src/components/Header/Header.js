import React from 'react';
import { Link } from 'react-router-dom';
import namespace from '../../utils/namespace';
import { Inner } from '..';

import './Header.scss';

const cls = namespace('bee-header');

export default function Header() {
    return (
        <div className={cls()}>
            <Inner className={cls('inner')}>
                <h1 className={cls('logo')}><Link to="/">别样剪辑</Link></h1>
                <ul className={cls('links')}>
                    <li><a href="/helps">帮助</a></li>
                    <li><a href="/helps">关于作者</a></li>
                    <li><a href="/helps">建议反馈</a></li>
                </ul>
            </Inner>
        </div>
    );
}
