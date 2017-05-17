import {h, Component, render} from 'ireact';

class CommentStar extends Component {

    state = {
        disabled: false,
        activeStar: 0
    };

    static defaultProps = {
        MAX_COUNT: 5,
        star: 3,
        disabled: false,
        onMove: function () {
        },
        onLeave: function () {
        },
        onPick: function () {
        }
    };

    componentWillMount() {
        console.log('componentWillMount: ' + this.props.star);
        this.setState({
            activeStar: this.props.star,
            disabled: this.props.disabled
        })
    }

    shouldComponentUpdate(nextProps, nextState) {

        let r = nextState.activeStar !== this.state.sctiveStar;
        console.log('shouldComponentUpdate: ' + r);
        return r;
    }

    componentWillReceiveProps(nextProps) {
        console.log('componentWillReceiveProps: ' + nextProps.star)
    }

    onMouseClick = () => {

        const star = 5;

        this.setState({
            activeStar: star
        });

        // 需要通过外部组件来修改 prop里star的值
        this.props.onPick(star);

    };

    onMouseLeave = () => {
        this.setState({
            activeStar: this.props.star
        });
        console.log('mouseleave star: ' + this.state.activeStar);
    };

    render() {
        const MAX_COUNT = this.props.MAX_COUNT;
        const activeStar = this.state.activeStar;
        const temp = new Array(MAX_COUNT).fill(1);

        console.log('render props.star: ' + this.props.star);

        return (
            <span
                className='demo-add-comt-rate'
                onClick={this.onMouseClick}
                onMouseLeave={this.onMouseLeave}
                ref={(node) => this.main = node}
            >
                {
                    temp.map((item, index) => {
                        let cln = index < activeStar ? 'star stared' : 'star';
                        return <a
                            key={index}
                            href="javascript:;"
                            className={cln}
                        >star{index}</a>

                    })
                }
            </span>
        )
    }
}

class CommentStarCon extends Component {
    state = {
        star: this.props.star
    }

    static defaultProps = {
        star: 3
    }

    pick = (rank) => {
        console.log('mouseclick');
        this.setState({
            star: rank
        })
    }

    render() {
        return (
            <div>
                <CommentStar
                    star={this.state.star}
                    onPick={this.pick}
                />
            </div>
        )
    }
}

export {CommentStarCon};
