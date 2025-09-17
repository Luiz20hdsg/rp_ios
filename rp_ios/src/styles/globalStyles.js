import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  logo: {
    width: 164.84,
    height: 42.61,
    alignSelf: 'center',
    marginTop: 50,
  },
  text: {
    fontFamily: 'Roboto',
    color: '#FFFFFF',
  },
  button: {
    borderWidth: 1,
    borderColor: '#A1C014',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#A1C014',
    padding: 10,
    color: '#FFFFFF',
    borderRadius: 8,
  },
  rectangle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2E2E2E',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});