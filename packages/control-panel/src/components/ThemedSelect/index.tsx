import { useColorModeValue } from '@chakra-ui/react';
import Select, {
  GroupBase, StylesConfig,
} from 'react-select';
import getChakraColor from '../../utils/getChakraColor';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}
type SelectStyles = StylesConfig<SelectOption, false, GroupBase<SelectOption>> | undefined;

interface Props {
  selectedValue?: string;
  options: SelectOption[];
  loading?: boolean;
  isDisabled?: boolean
  id?: string
  onChangedValue: (value: string) => void;
}

export const ThemedSelect: React.FC<Props> = ({
  selectedValue, options, loading, onChangedValue, id, isDisabled,
}) => {
  const styles = useColorModeValue<SelectStyles, SelectStyles>({}, {
    menu: (provided) => ({
      ...provided,
      backgroundColor: getChakraColor('gray.700'),
      height: '40px',
    }),
    control: (provided, state) => ({
      ...provided,
      background: getChakraColor('gray.800'),
      color: 'white',
      height: '40px',
      paddingLeft: '8px',
      borderColor: state.isFocused
        ? getChakraColor('gray.600')
        : getChakraColor('gray.700'),
    }),
    input: (provided) => ({
      ...provided,
      color: getChakraColor('gray.50'),
    }),
    singleValue: (provided) => ({
      ...provided,
      color: getChakraColor('gray.50'),
    }),
    option: (provided, state) => ({
      ...provided,
      color: 'rgba(255,255,255,0.92)',
      // eslint-disable-next-line no-nested-ternary
      background: state.isFocused && !state.isSelected
        ? getChakraColor('gray.600')
        : state.isSelected
          ? getChakraColor('blue.500') : getChakraColor('gray.700'),
    }),
  });

  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <Select
      id={id}
      isDisabled={loading || isDisabled}
      isLoading={loading}
      options={options}
      // @ts-ignore
      styles={styles}
      value={selectedOption}
      onChange={(option) => (option ? onChangedValue(option.value) : null)}
      // components={{
      //   Option: IconOption,
      // }}
    />
  );
};

// type IconOptionProps = Parameters<typeof Option>[0];

// const IconOption: React.FC<IconOptionProps> = (props) => {
//   const { data } = props;

//   const castedData = data as SelectOption;

//   return (
//   // eslint-disable-next-line react/jsx-props-no-spreading
//     <Option {...props}>
//       <Avatar src={castedData.icon} name={castedData.value} />
//       {castedData.label}
//     </Option>
//   );
// };
