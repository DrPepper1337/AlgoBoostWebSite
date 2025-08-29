
const DropDownItem = ({ icon: Icon, text, onClick }) => {
  return (
    <li className="dropdownItem" onClick={onClick}>
      <Icon className="dropdown-icon" />
      <span>{text}</span>
    </li>
  );
};

export default DropDownItem;