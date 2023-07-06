

export default ({text, href, onClick, k, extraClasses, target}) =>
    <a href={href}
       target={target}
       onClick={onClick}
       className={`font-medium text-blue-600 dark:text-blue-500 hover:underline ${extraClasses || ''}`}>
        {text}
    </a>
