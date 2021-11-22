import React from "react";
import namespace from '../../utils/namespace';

const cls = namespace('bee-filepicker');

export default class FilePicker extends React.PureComponent {
    render() {
        const {className = '', directory, ...restProps} = this.props;
        return (
            <input
                type="file"
                className={`${cls()} ${className}`}
                webkitdirectory={directory ? '' : null}
                directory={directory ? '' : null}
                multiple
                {...restProps}
            />
        );
    }
};

FilePicker.defaultProps = {
    directory: false, // 选择文件夹
};
