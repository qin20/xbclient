export default function namespace(ns, seperator = '--') {
    return (name) => name ? `${ns}${seperator}${name}` : ns;
}
