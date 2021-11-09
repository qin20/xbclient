import React from "react";
import namespace from '../../utils/namespace';

const cls = namespace('bee-filepicker');

export default class FilePicker extends React.PureComponent {
    render() {
        const {className = '', ...restProps} = this.props;
        return (
            <input type="file" className={`${cls()} ${className}`} {...restProps} />
        );
    }
};
