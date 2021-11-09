import React from 'react';
import { Link } from 'react-router-dom';
import ReactCrop from 'react-image-crop';
import Color from 'color';
import { SwatchesPicker } from 'react-color';
import { Breadcrumb, Form, Input, Button, InputNumber, message } from 'antd';
import { Page } from '../../components';
import namespace from '../../utils/namespace';
import './PosterClip.scss';

const cls = namespace('bee-poster-clip');

export default class PosterClip extends React.Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.saveRef = React.createRef();
        this.state = {
            clips: [{}],
            src: null,
            title: '《影片名称》',
            color: '#ff8a65',
            border: 2,
            number: '1,2,3',
            padding: 10,
            corp: {
                aspect: 9 / 4,
            },
        };
        this.reader  = new FileReader();
        this.reader.addEventListener("load", () => {
            this.setState({ src: this.reader.result });
        }, false);
    }

    getNumbers() {
        return this.state.number.split(/\s*[,，]\s*/);
    }

    draw = () => {
        if (!this.image) {
            return;
        }

        const canvas = this.canvasRef.current;
        const corp = this.state.corp;
        const ctx = this.canvasRef.current.getContext('2d');
        const originw = this.image.naturalWidth;
        const originh = this.image.naturalHeight;
        const imgw = this.image.width;
        const imgh = this.image.height;
        const corpw = corp.width || imgw;
        const corph = corp.height || imgh;
        const ratiow = originw / imgw;
        const ratioh = originh / imgh;
        const padding = this.state.padding;
        const border = this.state.border > 0 ? this.state.border : -this.state.border;

        canvas.width = corpw;
        canvas.height = corph;

        this.drawRect(canvas.width, canvas.height, 10, padding, border);
        ctx.save();
        ctx.clip();
        ctx.globalCompositeOperation='destination-over';
        ctx.drawImage(
            this.image,
            corp.x * ratiow, corp.y * ratioh, corpw / 3 * ratiow, corph * ratioh,
            padding, padding, (corpw - 2 * padding) / 3, corph - 2 * padding
        );
        ctx.drawImage(
            this.image,
            (corp.x + corpw / 3) * ratiow, corp.y * ratioh, corpw / 3 * ratiow, corph * ratioh,
            padding + (corpw - 2 * padding) / 3, padding, (corpw - 2 * padding) / 3, corph - 2 * padding
        );
        ctx.drawImage(
            this.image,
            (corp.x + corpw / 3 * 2) * ratiow, corp.y * ratioh, corpw / 3 * ratiow, corph * ratioh,
            padding + (corpw - 2 * padding) / 3 * 2, padding, (corpw - 2 * padding) / 3, corph - 2 * padding
        );
        ctx.restore();

        ctx.save();
        ctx.font = "24px KaiTi";
        ctx.fillStyle = Color(this.state.color).lighten(0.3);
        const nums = this.getNumbers();
        ctx.fillText(nums[0] || '1', corpw / 6, corph - padding - 10);
        ctx.fillText(nums[1] || '2', corpw / 6 * 3, corph - padding - 10);
        ctx.fillText(nums[2] || '3', corpw / 6 * 5, corph - padding - 10);
        ctx.restore();

        ctx.font = "26px STXinwei";
        ctx.fillStyle = Color(this.state.color).darken(0.3);
        ctx.textAlign = 'right';
        ctx.fillText(this.state.title, corpw - padding - 6, padding + 30);
    }

    drawRect(width, height, radius, padding, strokeWidth) {
        const ctx = this.canvasRef.current.getContext('2d');
        ctx.beginPath();
        radius = radius + padding;
        ctx.moveTo(radius, padding);
        ctx.lineTo(width - radius, padding);
        ctx.quadraticCurveTo(width - padding, padding, width - padding, radius);
        ctx.lineTo(width - padding, height - radius);
        ctx.quadraticCurveTo(width - padding, height - padding, width - radius, height - padding);
        ctx.lineTo(radius, height - padding);
        ctx.quadraticCurveTo(padding, height - padding, padding, height - radius);
        ctx.lineTo(padding, radius);
        ctx.quadraticCurveTo(padding, padding, radius, padding);
        ctx.lineWidth = strokeWidth * 2;
        const gradient = ctx.createLinearGradient(width / 2, padding, width / 2, height - 2 * padding);
        // Add three color stops
        gradient.addColorStop(0, Color(this.state.color).darken(0.3));
        gradient.addColorStop(1, Color(this.state.color).lighten(0.3));
        ctx.strokeStyle = gradient;
        ctx.stroke();
        ctx.closePath();
    }

    saveImage = () => {
        if (!this.state.corp.width || !this.state.corp.height) {
            message.warning('请先选择裁剪区域！');
            return;
        }
        const canvas = this.canvasRef.current;
        this.dataToImage(`${this.state.title}_01.png`, canvas, 0, 0, canvas.width / 3, canvas.height);
        this.dataToImage(`${this.state.title}_02.png`, canvas, canvas.width / 3, 0, canvas.width / 3, canvas.height);
        this.dataToImage(`${this.state.title}_03.png`, canvas, canvas.width / 3 * 2, 0, canvas.width / 3, canvas.height);
    }

    dataToImage = (name, image, x, y, width, height) => {
        var canvas = this.saveRef.current;
        var ctx = canvas.getContext('2d');
        canvas.width = 1920;
        canvas.height = 1920 / width * height;
        ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
        var link = document.createElement('a');
        link.download = name || 'filename.png';
        link.href = canvas.toDataURL()
        link.click();
    }

    onImageLoaded = (image) => {
        this.image = image;
    }

    onCorpChange = (corp) => {
        this.setState({ corp }, () => {
            this.draw();
        });
    }

    onColorChange = (color) => {
        this.setState({ color: color.hex }, () => {
            this.draw();
        });
    }

    onFileChange = (e) => {
        this.reader.readAsDataURL(e.target.files[0]);
    }

    onBorderChange = (value) => {
        this.setState({ border: value }, () => {
            this.draw();
        });
    }

    onPaddingChange = (value) => {
        this.setState({ padding: value }, () => {
            this.draw();
        });
    }

    onTitleChange = (e) => {
        this.setState({ title: e.target.value }, () => {
            this.draw();
        });
    }

    onNumberChange = (e) => {
        this.setState({ number: e.target.value }, () => {
            this.draw();
        });
    }

    render() {
        return (
            <Page
                title={(
                    <Breadcrumb>
                        <Breadcrumb.Item><Link to="/">首页</Link></Breadcrumb.Item>
                        <Breadcrumb.Item>抖音封面制作</Breadcrumb.Item>
                    </Breadcrumb>
                )}
                buttons={(
                    <>
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={this.saveImage}
                        >
                            保存
                        </Button>
                    </>
                )}
            >
                <Form
                    ref={this.form}
                    className={cls('form')}
                    name="basic"
                    labelCol={{
                        span: 2,
                    }}
                    initialValues={{
                        bgVolume: this.defaultVolume
                    }}
                    wrapperCol={{
                        span: 22,
                    }}
                    onFinish={this.onFinish}
                    autoComplete="off"
                >
                    <Form.Item label="封面图片">
                        <input type="file" onChange={this.onFileChange} />
                    </Form.Item>
                    <Form.Item label="影片标题">
                        <Input onChange={this.onTitleChange} defaultValue={this.state.title}></Input>
                    </Form.Item>
                    <Form.Item label="自定义下标">
                        <Input onChange={this.onNumberChange} defaultValue={this.state.number}></Input>
                    </Form.Item>
                    <Form.Item label="边框大小">
                        <InputNumber onChange={this.onBorderChange} defaultValue={this.state.border} />
                    </Form.Item>
                    <Form.Item label="空隙大小" className={cls('inline-item')}>
                        <InputNumber onChange={this.onPaddingChange} defaultValue={this.state.padding} />
                    </Form.Item>
                    <Form.Item label="颜色">
                        <SwatchesPicker
                        className={cls('color')}
                        onChange={this.onColorChange}
                        width={null}
                        height={null}
                        colors={[
                            ["#e57373", "#ffcdd2"],
                            ["#f06292", "#f8bbd0"],
                            ["#ba68c8", "#e1bee7"],
                            ["#9575cd", "#d1c4e9"],
                            ["#7986cb", "#c5cae9"],
                            ["#64b5f6", "#bbdefb"],
                            ["#4fc3f7", "#b3e5fc"],
                            ["#4dd0e1", "#b2ebf2"],
                            ["#4db6ac", "#b2dfdb"],
                            ["#81c784", "#c8e6c9"],
                            ["#aed581", "#dcedc8"],
                            ["#dce775", "#f0f4c3"],
                            ["#fff176", "#fff9c4"],
                            ["#ffd54f", "#ffecb3"],
                            ["#ffb74d", "#ffe0b2"],
                            ["#ff8a65", "#ffccbc"],
                            ["#a1887f", "#d7ccc8"],
                            ["#90a4ae", "#cfd8dc"],
                            ["#D9D9D9", "#FFFFFF"],
                        ]}
                    />
                    </Form.Item>
                </Form>
                <div className={cls('container')}>
                    <div>
                        <p>请用鼠标选择裁剪区域：</p>
                        <ReactCrop
                            maxWidth={660}
                            className={cls('corp')}
                            src={this.state.src}
                            crop={this.state.corp}
                            onChange={this.onCorpChange}
                            onImageLoaded={this.onImageLoaded}
                        />
                    </div>
                    <div>
                        <p>预览：</p>
                        <canvas
                            ref={this.canvasRef}
                            className={cls('preview')}
                        ></canvas>
                        <canvas
                            ref={this.saveRef}
                        ></canvas>
                    </div>
                </div>

            </Page>
        );
    }
}