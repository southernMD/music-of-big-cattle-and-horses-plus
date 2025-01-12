import { styled } from "@styils/vue";

export const DivLoading = styled('div', {
    userSelect: 'none',
    position: 'fixed',
    left: '0',
    right: '0',
    top: '0',
    bottom: '0',
    margin: 'auto auto',
    borderRadius: '2em',
    height: '50px',
    minWidth: '60px',
    maxWidth: '260px',
    width: 'auto',
    backgroundColor: 'rgba(0, 0, 0, .8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '999999',
});

export const Message = styled('span', {
    color: 'white',
    marginLeft: '5px',
    '&.error-red': {
        color: 'rgb(254, 57, 57)',
    },
});

export const Tra = styled('div', {
    position: 'relative',
    left: '-10px',
    width: '10px',
    height: 'auto',
    zIndex: '999',
});

export const Moving = styled('div', {
    position: 'relative',
    left: '-10px',
    width: '10px',
    height: '10px',
    zIndex: '999',
    animation: 'active 2s linear infinite',
    '@keyframes active': {
        '0%': {
            transform: 'rotate(0deg)',
        },
        '100%': {
            transform: 'rotate(360deg)',
        },
    },
});

export const Span = styled('span', {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    transform: 'rotate(calc(30deg * var(--i)))',
});

export const After = styled('span', {
    content: '""',
    position: 'absolute',
    right: '0',
    top: 'calc(50% - 10px)',
    width: '2px',
    height: '4px',
    background: 'rgb(117, 117, 117)',
    borderRadius: '2em',
});

export const Error = styled('div', {
    width: '10px',
    zIndex: '999',
});

export const Icon = styled('i', {
    color: 'rgb(254, 57, 57)',
    fontSize: '20px',
});