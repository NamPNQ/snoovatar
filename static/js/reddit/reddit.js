r = window.r || {};
r.preload = {
    timestamp: new Date(),
    maxAge: 5 * 60 * 1000,
    data: {},

    isExpired: function() {
        return new Date() - this.timestamp > this.maxAge
    },

    set: function(data) {
        _.extend(this.data, data)
    },

    read: function(url) {
        var data = this.data[url]

        // short circuit "client side" fragment urls (which don't expire)
        if (url[0] == '#') {
            return data
        }

        if (this.isExpired()) {
            return
        }

        return data
    }
}
!function(r, undefined) {
    r.ajax = function(request) {
        var url = request.url

        if (request.type == 'GET' && _.isEmpty(request.data)) {
            var preloaded = r.preload.read(url)
            if (preloaded != null) {
                if (request.dataFilter) {
                    preloaded = request.dataFilter(preloaded, 'json')
                }

                request.success(preloaded)

                var deferred = new jQuery.Deferred
                deferred.resolve(preloaded)
                return deferred
            }
        }

        var isLocal = url && (url[0] == '/' || url.lastIndexOf(r.config.currentOrigin, 0) == 0)
        if (isLocal) {
            if (!request.headers) {
                request.headers = {}
            }
        }

        return $.ajax(request)
    };
}(r);