import React from "react";
import classnames from "classnames";
import { SwitcherOutlined, BorderOutlined, MinusOutlined, CloseOutlined } from '@ant-design/icons';
import namespace from '../../utils/namespace';
import Actions from './Actions';

const cls = namespace('bee-titlebar');

export default class TitleBar extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isMaximize: false,
        }
    }

    componentDidMount() {
        window.electron.ipcRenderer.on('maximize-change', (event, data) => {
            this.setState({ isMaximize: data });
        });
    }

    componentWillUnmount() {
        window.electron.ipcRenderer.removeAllListeners('maximize-change');
    }

    render() {
        const { className, minimizable, maximizable, closable, ...restProps } = this.props;
        return (
            <div className={classnames(cls(), className)} {...restProps}>
                <Actions className={cls('btns')}>
                    {minimizable && <MinusOutlined className={`${cls('btn')} ${cls('btn-min')}`} /> }
                    {maximizable && (
                        this.state.isMaximize
                            ? <SwitcherOutlined className={`${cls('btn')} ${cls('btn-unmax')}`} />
                            : <BorderOutlined className={`${cls('btn')} ${cls('btn-max')}`} />
                    )}
                    {closable && <span className={`${cls('btn')} ${cls('btn-close')}`}><CloseOutlined /></span>}
                </Actions>
            </div>
        )
    }
}

TitleBar.defaultProps = {
    minimizable: true,
    maximizable: true,
    closable: true,
};
