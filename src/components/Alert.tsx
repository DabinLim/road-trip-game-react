import React, { PropsWithChildren, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

interface Props {
    title?: string;
    body: ReactNode;
    onConfirm?: () => void;
    onConfirmText?: string; 
}

export default function Alert({
    title,
    body,
    onConfirm,
    onConfirmText,
}: PropsWithChildren<Props>) {
    const modalRoot = document.querySelector('#modal-root');
    if (!modalRoot) return <></>
    return ReactDOM.createPortal(
        <Background>
            <ModalContainer>
                <Title>
                    Title
                </Title>
                <Body>
                    Body
                </Body>
            </ModalContainer>
        </Background>, modalRoot
    )
}

const Background = styled.div`
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ModalContainer = styled.div`
    background-color: #fff;
    padding: 20px;
`;

const Title = styled.p`
    font-size: 20px;
`;

const Body = styled.span`
    font-size: 16px;
`;