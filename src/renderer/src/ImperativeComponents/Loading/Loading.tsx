import { createApp, defineComponent, PropType, ref, onMounted, h } from 'vue';
import { styled } from '@styils/vue';
import { After, DivLoading, Icon, Message, Moving, Span, Tra,Error as ErrorIcon } from './LoadingStyleComponents';
interface LoadingProps {
    loading?: boolean;
    type?: 'error' | string;
    width?: number;
    tra?: number;
    size?: number;
    message?: string;
    showTime?: number;
    onClose?: () => void;
  }

const Loading = defineComponent({
    props: {
        loading: {
            type: Boolean,
            required: false,
        },
        type: {
            type: String as PropType<'error' | string>,
            required: false,
        },
        width: {
            type: Number,
            required: false,
        },
        tra: {
            type: Number,
            required: false,
        },
        size: {
            type: Number,
            required: false,
        },
        message: {
            type: String,
            required: false,
        },
        showTime: {
            type: Number,
            required: false,
        },
    },
    setup(props, { emit }) {
        onMounted(() => {
            if (props.showTime) {
                const t = setTimeout(() => {
                    emit('close');
                    clearTimeout(t);
                }, props.showTime as number);
            }
        });

        return () => (
            <DivLoading
                class="loading"
                onClick={(e) => e.stopPropagation()}
                // @ts-ignore
                style={{ maxWidth: props.width ? `${props.width}px` : '260px', zIndex: '999999' }}
            >
                <Tra
                    // @ts-ignore
                    style={{ transform: props.tra ? `translateX(${props.tra}px)` : 'translateX(0px)' }}
                >
                    {props.loading && (
                        <Moving>
                            {[...Array(13)].map((_, i) => (
                                // @ts-ignore
                                <Span style={{ '--i': i - 1 }} key={i}>
                                    <After />
                                </Span>
                            ))}
                        </Moving>
                    )}
                    {props.type === 'error' && (
                        <ErrorIcon>
                            <Icon class="iconfont icon-cuowu" />
                        </ErrorIcon>
                    )}
                </Tra>
                <Message
                    class={['message', props.type === 'error' ? 'error-red' : ''].join(' ')}
                    // @ts-ignore
                    style={{ fontSize: props.size ? `${props.size}px` : 'inherit', }}
                >
                    {props.message}
                </Message>
            </DivLoading>
        );
    },
});
export default function mountLoading(props?: LoadingProps) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const app = createApp({
        setup() {
            const handleClose = () => {
                app.unmount();
                document.body.removeChild(div);
            };
            return () => (<Loading
                {...props}
                onClose={handleClose}
            />)
        }
    });

    app.mount(div);

    return {
        destory: () => {
            app.unmount();
            document.body.removeChild(div);
        }
    };
}