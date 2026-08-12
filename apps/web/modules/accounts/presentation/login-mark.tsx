function LoginMark() {
  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center gap-2 text-brand-800">
        <svg
          width={30}
          height={30}
          viewBox="0 0 48 48"
          aria-hidden="true"
          className="text-brand-600"
        >
          <path
            d="M 38.11 24.64 A 14.8 14.8 0 1 1 14.23 15.46 A 12.8 12.8 0 0 0 38.11 24.64 Z"
            fill="currentColor"
          />
          <circle cx="26.5" cy="16" r="5.6" fill="currentColor" />
        </svg>
        <span className="font-head text-[23px] font-extrabold tracking-tight">
          Zelita
        </span>
      </div>
    </div>
  );
}

export { LoginMark };
