import React from "react";
import classNames from "classnames";
import namespace from '../../utils/namespace';

const cls = namespace('bee-panel-content');

class PanelContent extends React.PureComponent {
    render() {
        const { className, forwardedRef, ...restProps } = this.props;
        return (
            <div ref={forwardedRef} className={classNames(cls(), className)} {...restProps}/>
        );
    }
};

export default React.forwardRef((props, ref) => {
    return <PanelContent forwardedRef={ref} {...props} />
});
