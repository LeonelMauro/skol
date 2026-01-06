import BarbaIcon from '../assets/icons/svg/barba.svg?react';
import CejaIcon from '../assets/icons/svg/ceja.svg?react';
import MaquinaIcon from '../assets/icons/svg/maquina-pelo.svg?react';
import MascarillaIcon from '../assets/icons/svg/mascarilla.svg?react';
import NavajaIcon from '../assets/icons/svg/navaja.svg?react';
import ColorIcon from '../assets/icons/svg/color.svg?react';
import TijerasIcon from '../assets/icons/svg/tijeras.svg?react';
import LavadoIcon from '../assets/icons/svg/lavado.svg?react';


export const serviceIcons = {
  barba: BarbaIcon,
  ceja: CejaIcon,
  maquina: MaquinaIcon,
  mascarilla: MascarillaIcon,
  navaja: NavajaIcon,
  color: ColorIcon,
  tijeras: TijerasIcon,
  lavado: LavadoIcon
};

export type ServiceIconKey = keyof typeof serviceIcons;

export const DEFAULT_SERVICE_ICON: ServiceIconKey = 'tijeras';
