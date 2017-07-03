import styled from 'styled-components';

import {
  alertBg,
  alertColor,
} from '../../utils/styleUtils';

export const Container = styled.div`
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${(props) => props.isNotTable ?
    `margin-top: 52px;
    background-color: ${alertBg(props.type, 'solid')};
    position: fixed;`
    :
    `margin-top: 0;
    background-color: none;`
  }
`;

export const Wrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  height: 36px;
  width: 420px;
  padding: 0 12px;
  color: ${(props) => alertColor(props.type)};
  ${(props) => props.isNotTable ?
    `border: none;
     margin: none;
     background-color: none;
    `
    :
    `border-radius: 0 0 8px 8px;
     margin-left: 24px;
     background-color: ${alertBg(props.type, 'solid')};
    `
  };
`;

export const Category = styled.h3`
  font-size: 12px;
`;

export const Details = styled.span`
  padding-left: 8px;
  font-size: 12px;
`;

export const IconWrapper = styled.div`
  background-color: none;
  margin: 0 0 0 auto;
  padding-right: 0;
`;

export const Icon = styled.i`
  padding: 4px;
  font-size: 14px;
  &:last-child {
    padding-right: 0;
    margin-right: 0;
  }
`;

export const ButtonWrapper = styled.button`
  background-color: none;
`;