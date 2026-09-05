type LogoProps = {
    className?: string;
    size?: number;
};

export default function Logo({ className = '', size = 32 }: LogoProps) {
    return (
        <img
            src="/logo.svg"
            alt=""
            width={size}
            height={size}
            className={className}
        />
    );
}
