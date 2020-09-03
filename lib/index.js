import React, {Component} from 'react'
import {View, Image, PanResponder, Dimensions} from 'react-native'
import styles from './styles'

const {width} = Dimensions.get('window');

export default class Image360Viewer extends Component {
    static defaultProps = {
        width, // width of image
        height: 300, // height of image
        srcset: [],
        rotationRatio: 0.5, // the drag distance compares to 180 degree: width / rotationRatio = 180 degree,
    }


    constructor(props) {
        super(props)
        this.createPanResponder()
        this.lastIndex = 0;
        this.state = {
            rotation: 0,
            rotatePeriod: 360 / props.srcset.length
        }
    }

    createPanResponder = () => {
        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderGrant: (evt, gestureState) => {
                // console.log('onPanResponderGrant', gestureState)
                this.startMoving(gestureState)
            },
            onPanResponderMove: (evt, gestureState) => {
                // console.log('onPanResponderMove', gestureState)
                this.moving(gestureState)
            },
            onPanResponderRelease: (evt, gestureState) => {
                // console.log('onPanResponderRelease', gestureState)
                this.endMoving(gestureState)
            }
        })
    }

    startMoving = (gestureState) => {
        this.startX = gestureState.moveX
        this.startRotation = this.state.rotation
    }

    moving = (gestureState) => {
        this.currentX = gestureState.moveX
        this.updateRotation()
    }

    endMoving = (gestureState) => {
        this.currentX = gestureState.moveX
        this.updateRotation()
    }

    updateRotation = () => {
        const {rotationRatio,} = this.props;
        const deltaRotation = (this.currentX - this.startX) * 180 / (rotationRatio * this.props.width);
        this.setState({rotation: this.startRotation + deltaRotation});
    }

    getIndex = () => {
        const {rotation, rotatePeriod} = this.state
        const mRotation = rotation - Math.floor(rotation / 360) * 360
        return Math.floor(mRotation / rotatePeriod)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {onIndexChange} = this.props
        const index = this.getIndex();
        if (this.lastIndex !== index && onIndexChange) {
            onIndexChange(index);
            this.lastIndex = index;
        }
    }

    getImage = () => {
        const {srcset} = this.props
        const index = this.getIndex();
        return srcset[index]
    }

    render() {
        const {width, height, imageStyle, srcset} = this.props
        const index = this.getIndex();
        console.log(index);
        return (
            <View {...this.panResponder.panHandlers}>
                {srcset.map((imageSrc, idx) => {
                    return <Image
                        key={idx}
                        fadeDuration={0}
                        source={imageSrc}
                        style={[styles.image, {
                            width,
                            height,
                            display: idx !== index && index !== 0 ? 'none' : 'flex',
                        }]}
                    />;
                })}
            </View>
        )
    }
}
